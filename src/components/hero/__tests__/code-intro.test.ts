import { describe, expect, it } from "vitest";
import { CHAR_MS, PAUSE_MS, buildScript, charDelayMs, totalChars, visibleTokens } from "@/components/hero/code-intro";

describe("buildScript", () => {
  it("includes the name as a string token and render as a fn token (normal)", () => {
    const tokens = buildScript({ name: "최영기", title: "Backend Engineer", tagline: "실전에 강한" });
    expect(tokens).toContainEqual({ kind: "string", text: '"최영기"' });
    expect(tokens).toContainEqual({ kind: "fn", text: "render" });
  });

  it("omits the tagline ident token when tagline is undefined (boundary)", () => {
    const tokens = buildScript({ name: "최영기", title: "Backend Engineer" });
    expect(tokens.some((t) => t.kind === "ident" && t.text === "tagline")).toBe(false);
  });

  it("omits the tagline ident token when tagline is an empty string (boundary)", () => {
    const tokens = buildScript({ name: "최영기", title: "Backend Engineer", tagline: "" });
    expect(tokens.some((t) => t.kind === "ident" && t.text === "tagline")).toBe(false);
  });

  it("escapes a quote inside the name so the string token round-trips to the original value (error/edge)", () => {
    const tokens = buildScript({ name: '최"영기', title: "Backend Engineer" });
    const nameToken = tokens.find((t) => t.kind === "string" && t.text.includes("영기"));
    expect(nameToken).toBeDefined();
    // a naive `'"' + value + '"'` concatenation would also start/end with a quote but would NOT
    // produce a backslash-escaped inner quote, so this pins the exact escaped text.
    expect(nameToken!.text).toBe('"최\\"영기"');
    expect(JSON.parse(nameToken!.text)).toBe('최"영기');
  });
});

describe("visibleTokens", () => {
  const tokens = buildScript({ name: "최영기", title: "Backend Engineer", tagline: "실전에 강한" });

  it("returns an empty array at count 0 (boundary)", () => {
    expect(visibleTokens(tokens, 0)).toEqual([]);
  });

  it("returns an empty array for a negative count (boundary)", () => {
    expect(visibleTokens(tokens, -3)).toEqual([]);
  });

  it("returns every token unchanged once count exceeds the total (normal)", () => {
    expect(visibleTokens(tokens, totalChars(tokens) + 5)).toEqual(tokens);
  });

  it("truncates the token straddling the cut so its length equals the remainder (mid-token/error)", () => {
    const cut = 5;
    const visible = visibleTokens(tokens, cut);
    const last = visible[visible.length - 1];
    const consumedBefore = visible.slice(0, -1).reduce((s, t) => s + t.text.length, 0);
    expect(last.text.length).toBe(cut - consumedBefore);
  });
});

describe("charDelayMs", () => {
  it("pauses after a newline char regardless of the previous token (normal)", () => {
    expect(charDelayMs(undefined, "\n")).toBe(CHAR_MS + PAUSE_MS);
  });

  it("pauses when the previous token ends with '{' (boundary)", () => {
    expect(charDelayMs({ kind: "punct", text: "{" }, "x")).toBe(CHAR_MS + PAUSE_MS);
  });

  it("pauses when the previous token ends with ',' (boundary)", () => {
    expect(charDelayMs({ kind: "punct", text: "," }, "x")).toBe(CHAR_MS + PAUSE_MS);
  });

  it("uses the base delay for a plain character with no special previous token (normal)", () => {
    expect(charDelayMs({ kind: "ident", text: "name" }, "x")).toBe(CHAR_MS);
  });

  it("uses the base delay when there is no previous token and the char is not a newline (error/edge)", () => {
    expect(charDelayMs(undefined, "a")).toBe(CHAR_MS);
  });
});
