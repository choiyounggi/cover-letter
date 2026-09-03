export function Footer({ links }: { links: { label: string; url: string }[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto max-w-6xl border-t border-border px-6 py-16">
      {links.length > 0 && (
        <ul className="flex flex-wrap gap-4">
          {links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-sm text-fg-muted">© {year} 최영기</p>
      <p className="mt-2 font-mono text-xs text-fg-muted">Built with Next.js · Prisma · Three.js</p>
    </footer>
  );
}
