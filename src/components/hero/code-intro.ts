export type TokenKind = "keyword" | "ident" | "punct" | "string" | "fn" | "comment" | "newline";
export type Token = { kind: TokenKind; text: string };
export type IntroProfile = { name: string; title: string; tagline?: string };

export const CHAR_MS = 28;
export const PAUSE_MS = 120;

const nl = (): Token => ({ kind: "newline", text: "\n" });
const punct = (text: string): Token => ({ kind: "punct", text });
const ident = (text: string): Token => ({ kind: "ident", text });
const str = (value: string): Token => ({ kind: "string", text: JSON.stringify(value) });

function fieldLine(key: string, value: string): Token[] {
  return [punct("  "), ident(key), punct(": "), str(value), punct(","), nl()];
}

export function buildScript(profile: IntroProfile): Token[] {
  const tokens: Token[] = [
    { kind: "comment", text: "// profile.ts" },
    nl(),
    { kind: "keyword", text: "const" },
    ident(" engineer "),
    punct("="),
    punct(" {"),
    nl(),
    ...fieldLine("name", profile.name),
    ...fieldLine("role", profile.title),
  ];
  if (profile.tagline) {
    tokens.push(...fieldLine("tagline", profile.tagline));
  }
  tokens.push(punct("}"), punct(";"), nl(), nl(), { kind: "fn", text: "render" }, punct("("), ident("engineer"), punct(");"));
  return tokens;
}

export function totalChars(tokens: Token[]): number {
  return tokens.reduce((sum, t) => sum + t.text.length, 0);
}

export function visibleTokens(tokens: Token[], count: number): Token[] {
  if (count <= 0) return [];
  const total = totalChars(tokens);
  if (count >= total) return tokens.map((t) => ({ ...t }));

  const result: Token[] = [];
  let consumed = 0;
  for (const tok of tokens) {
    const remaining = count - consumed;
    if (remaining <= 0) break;
    if (tok.text.length <= remaining) {
      result.push({ ...tok });
      consumed += tok.text.length;
    } else {
      result.push({ kind: tok.kind, text: tok.text.slice(0, remaining) });
      break;
    }
  }
  return result;
}

export function charDelayMs(prev: Token | undefined, char: string): number {
  const prevPauses = prev !== undefined && (prev.text.endsWith("{") || prev.text.endsWith(","));
  return char === "\n" || prevPauses ? CHAR_MS + PAUSE_MS : CHAR_MS;
}
