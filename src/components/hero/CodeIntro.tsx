"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { cn } from "@/lib/utils";
import "./code-intro.css";
import { type Token, type TokenKind, buildScript, charDelayMs, totalChars, visibleTokens } from "./code-intro";

const KIND_CLASS: Record<TokenKind, string> = {
  keyword: "text-syn-keyword",
  string: "text-syn-string",
  fn: "text-syn-fn",
  ident: "text-fg",
  punct: "text-fg-muted",
  comment: "text-syn-comment",
  newline: "",
};

function charAt(tokens: Token[], index: number): string {
  let consumed = 0;
  for (const tok of tokens) {
    if (index < consumed + tok.text.length) return tok.text[index - consumed];
    consumed += tok.text.length;
  }
  return "";
}

function splitLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const tok of tokens) {
    if (tok.kind === "newline") {
      lines.push([]);
    } else {
      lines[lines.length - 1].push(tok);
    }
  }
  return lines;
}

export function CodeIntro({ name, title, tagline }: { name: string; title: string; tagline?: string }) {
  const tokens = useMemo(() => buildScript({ name, title, tagline }), [name, title, tagline]);
  const total = totalChars(tokens);
  const reduced = useReducedMotionPref();
  const [count, setCount] = useState(() => (reduced ? total : 0));
  const done = reduced || count >= total;

  useEffect(() => {
    if (reduced) return;
    let raf: number;
    let last = performance.now();
    let acc = 0;
    let n = 0;

    const tick = (now: number) => {
      acc += now - last;
      last = now;
      while (n < total) {
        const prev: Token | undefined = n > 0 ? { kind: "punct", text: charAt(tokens, n - 1) } : undefined;
        const delay = charDelayMs(prev, charAt(tokens, n));
        if (acc < delay) break;
        acc -= delay;
        n += 1;
      }
      setCount(n);
      if (n < total) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, tokens, total]);

  const lines = splitLines(visibleTokens(tokens, count));

  return (
    <div className="grid gap-8 md:grid-cols-[7fr_5fr]">
      <div aria-hidden="true" className="code-frame min-w-0 overflow-x-auto" data-file="profile.ts">
        <pre className="px-4 py-4 font-mono text-[13px] leading-6 md:text-sm">
          <code>
            {lines.map((line, i) => (
              <span key={i} className="block">
                <span className="mr-4 select-none text-syn-comment">{String(i + 1).padStart(2, " ")}</span>
                {line.map((tok, j) => (
                  <span key={j} className={KIND_CLASS[tok.kind]}>
                    {tok.text}
                  </span>
                ))}
                {i === lines.length - 1 && !done && <span className="code-caret" />}
              </span>
            ))}
          </code>
        </pre>
      </div>
      <div className={cn("intro-out flex min-w-0 flex-col justify-end", done && "is-done")}>
        <p style={{ "--stagger": 0 } as CSSProperties} className="font-mono text-xs text-syn-comment">
          {"// output"}
        </p>
        <h1
          style={{ "--stagger": 1 } as CSSProperties}
          className="font-display text-5xl font-semibold tracking-tight md:text-7xl"
        >
          {name}
        </h1>
        <p style={{ "--stagger": 2 } as CSSProperties} className="mt-3 text-2xl text-fg-muted">
          {title}
        </p>
        {tagline && (
          <p style={{ "--stagger": 3 } as CSSProperties} className="mt-2 text-lg text-fg-muted">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}
