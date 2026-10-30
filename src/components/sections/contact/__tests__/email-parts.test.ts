import { describe, expect, it } from "vitest";
import { EMAIL_DOMAINS, composeEmail, emailPartsError, splitEmail } from "../email-parts";

describe("composeEmail", () => {
  it("joins trimmed parts with @ (normal)", () => {
    expect(composeEmail(" younggi ", " gmail.com ")).toBe("younggi@gmail.com");
  });
});

describe("emailPartsError", () => {
  it("accepts every template domain (normal)", () => {
    for (const domain of EMAIL_DOMAINS) expect(emailPartsError("younggi", domain)).toBeNull();
  });

  it("rejects malformed parts with a format error (error)", () => {
    expect(emailPartsError("younggi", "localhost")).toBe("올바른 이메일 형식이 아니에요.");
    expect(emailPartsError("you ng", "gmail.com")).toBe("올바른 이메일 형식이 아니에요.");
    expect(emailPartsError("a@b", "gmail.com")).toBe("올바른 이메일 형식이 아니에요.");
  });

  it("asks for both parts when either is empty or whitespace (boundary: empty input)", () => {
    expect(emailPartsError("", "gmail.com")).toBe("이메일 아이디와 도메인을 모두 입력해 주세요.");
    expect(emailPartsError("younggi", "   ")).toBe("이메일 아이디와 도메인을 모두 입력해 주세요.");
  });
});

describe("splitEmail", () => {
  it("splits at the first @ (normal)", () => {
    expect(splitEmail("me@company.co.kr")).toEqual({ local: "me", domain: "company.co.kr" });
  });

  it("returns null without an @ and splits an edge @ into an empty part (boundary)", () => {
    expect(splitEmail("me")).toBeNull();
    expect(splitEmail("")).toBeNull();
    expect(splitEmail("@gmail.com")).toEqual({ local: "", domain: "gmail.com" });
  });
});
