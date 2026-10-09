#!/usr/bin/env bash
# deploy/pi/deploy.sh <sha> — build <sha> into a fresh release dir on the Pi,
# then switch the `current` symlink and restart. The running site keeps serving
# the previous release until the switch, and a failed health check rolls back.
#
# Run by .github/workflows/deploy.yml over SSH. Secrets arrive as env vars:
#   PORTFOLIO_DB_PASSWORD, AUTH_SECRET (required)
#   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (optional — contact form falls back to admin settings)
# PORTFOLIO_DB_PASSWORD only takes effect when the DB container is first created;
# rotating it later needs a matching ALTER ROLE inside the container.
set -euo pipefail

SHA="${1:?usage: deploy.sh <git sha>}"
: "${PORTFOLIO_DB_PASSWORD:?PORTFOLIO_DB_PASSWORD is required}"
: "${AUTH_SECRET:?AUTH_SECRET is required}"

ROOT="$HOME/portfolio"
REPO="$ROOT/repo"
RELEASES="$ROOT/releases"
PORT=3102
DB_PORT=5437
KEEP_RELEASES=3

log() { printf '[deploy %s] %s\n' "$(date '+%H:%M:%S')" "$*"; }

[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "deploy.sh: not a full commit sha: $SHA" >&2; exit 1; }
[[ "$PORTFOLIO_DB_PASSWORD" =~ ^[A-Za-z0-9_-]+$ ]] || { echo "deploy.sh: PORTFOLIO_DB_PASSWORD must match [A-Za-z0-9_-]+" >&2; exit 1; }
# Values land in .env as KEY="value", which Next expands ($) and unescapes (\).
for name in AUTH_SECRET TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID; do
  case "${!name:-}" in
    *'"'* | *'$'* | *'`'* | *'\'* | *$'\n'*) echo "deploy.sh: $name contains \" \$ \` \\ or a newline" >&2; exit 1 ;;
  esac
done

mkdir -p "$RELEASES"
PREV=""
[ -L "$ROOT/current" ] && PREV="$(readlink "$ROOT/current")"
PREV_SHA="$(basename "${PREV:-none}")"
PREV_SHA="${PREV_SHA%%-*}"

# CI runs can finish out of order: never replace a newer deployed commit with its ancestor.
if [ -n "$PREV" ] && [ "$PREV_SHA" != "$SHA" ] && git -C "$REPO" merge-base --is-ancestor "$SHA" "$PREV_SHA" 2>/dev/null; then
  log "skip: $SHA is older than the deployed $PREV_SHA"
  exit 0
fi

# A unique dir per run, so re-deploying the live sha never touches the running release.
REL="$RELEASES/$SHA-$(date +%Y%m%d%H%M%S)"
cleanup_failed() {
  local status=$?
  if [ "$status" -ne 0 ] && [ "$(readlink "$ROOT/current" 2>/dev/null)" != "$REL" ]; then
    rm -rf -- "$REL"
  fi
}
trap cleanup_failed EXIT

if ! docker inspect portfolio-db >/dev/null 2>&1; then
  log "creating portfolio-db container"
  docker run -d --name portfolio-db --restart unless-stopped \
    -e POSTGRES_USER=portfolio -e POSTGRES_PASSWORD="$PORTFOLIO_DB_PASSWORD" -e POSTGRES_DB=portfolio \
    -v portfolio-pgdata:/var/lib/postgresql/data -p "127.0.0.1:${DB_PORT}:5432" postgres:17-alpine >/dev/null
elif [ "$(docker inspect -f '{{.State.Running}}' portfolio-db)" != true ]; then
  log "starting portfolio-db container"
  docker start portfolio-db >/dev/null
fi
# Over TCP: the image's first-boot init server listens on the socket only, then restarts.
db_ready() { docker exec portfolio-db pg_isready -h 127.0.0.1 -U portfolio -d portfolio >/dev/null 2>&1; }
for _ in $(seq 1 60); do db_ready && break; sleep 1; done
db_ready || { echo "deploy.sh: portfolio-db not ready" >&2; exit 1; }

log "extracting $SHA"
git -C "$REPO" cat-file -e "$SHA^{commit}"
mkdir -p "$REL"
git -C "$REPO" archive "$SHA" | tar -x -C "$REL"
# Each release owns its .env, so a rollback also restores the previous secrets.
(
  umask 077
  cat > "$REL/.env" <<EOF
DATABASE_URL="postgresql://portfolio:${PORTFOLIO_DB_PASSWORD}@127.0.0.1:${DB_PORT}/portfolio?schema=public"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_TRUST_HOST="true"
AUTH_GITHUB_ID="not-configured"
AUTH_GITHUB_SECRET="not-configured"
ADMIN_GITHUB_LOGIN="choiyounggi"
NEXT_PUBLIC_SITE_URL="https://portfolio.korea-data.cloud"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
EOF
)

cd "$REL"
log "npm ci"
npm ci --no-audit --no-fund
log "prisma migrate deploy"
npx prisma migrate deploy

# Content lives in prisma/seed.ts: re-seed on the first deploy and whenever the seed changed.
if [ -z "$PREV" ] || ! git -C "$REPO" cat-file -e "$PREV_SHA^{commit}" 2>/dev/null \
  || ! git -C "$REPO" diff --quiet "$PREV_SHA" "$SHA" -- prisma/seed.ts; then
  log "seeding content"
  npm run db:seed
fi

log "next build"
npm run build

mkdir -p "$HOME/.config/systemd/user"
if ! cmp -s "$REL/deploy/pi/portfolio-web.service" "$HOME/.config/systemd/user/portfolio-web.service"; then
  cp "$REL/deploy/pi/portfolio-web.service" "$HOME/.config/systemd/user/portfolio-web.service"
  systemctl --user daemon-reload
  systemctl --user enable portfolio-web.service >/dev/null
fi

switch_to() {
  ln -sfn "$1" "$ROOT/current.tmp"
  mv -Tf "$ROOT/current.tmp" "$ROOT/current"
  systemctl --user restart portfolio-web.service
}
healthy() {
  for _ in $(seq 1 60); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/")" = 200 ] && return 0
    sleep 1
  done
  return 1
}

log "switching current -> $(basename "$REL")"
switch_to "$REL"
if ! healthy; then
  log "health check failed"
  if [ -n "$PREV" ] && [ -d "$PREV" ]; then
    log "rolling back to $(basename "$PREV")"
    switch_to "$PREV"
  fi
  exit 1
fi

# Keep the newest releases; the live one and the one it replaced always survive.
find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | cut -d' ' -f2- \
  | tail -n +$((KEEP_RELEASES + 1)) | while read -r old; do
    [ "$old" = "$REL" ] || [ "$old" = "$PREV" ] || rm -rf -- "$old"
  done

log "deployed $SHA"
