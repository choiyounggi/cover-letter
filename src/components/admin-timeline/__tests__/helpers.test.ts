import { describe, it, expect } from "vitest";
import { toDateInput } from "../date-input";
import { linesToArray } from "../achievements";
import { TIMELINE_CATEGORY_LABELS } from "../labels";

describe("toDateInput", () => {
  it("formats a UTC midnight date as YYYY-MM-DD (normal)", () => {
    expect(toDateInput(new Date("2021-07-01T00:00:00Z"))).toBe("2021-07-01");
  });

  it("returns an empty string for null (boundary)", () => {
    expect(toDateInput(null)).toBe("");
  });

  it("uses UTC getters so a late-UTC-day timestamp does not shift to the next local day (boundary)", () => {
    expect(toDateInput(new Date("2021-07-01T23:30:00Z"))).toBe("2021-07-01");
  });
});

describe("linesToArray", () => {
  it("splits on newlines, trims, and drops empty lines (normal)", () => {
    expect(linesToArray("a\n b \n\n")).toEqual(["a", "b"]);
  });

  it("returns an empty array for an empty string (error/boundary)", () => {
    expect(linesToArray("")).toEqual([]);
  });
});

describe("TIMELINE_CATEGORY_LABELS", () => {
  it("has exactly 5 category keys with Korean labels (normal)", () => {
    expect(Object.keys(TIMELINE_CATEGORY_LABELS)).toHaveLength(5);
    expect(TIMELINE_CATEGORY_LABELS.LIFE).toBe("인생");
    expect(TIMELINE_CATEGORY_LABELS.EDUCATION).toBe("학업");
    expect(TIMELINE_CATEGORY_LABELS.CAREER).toBe("경력");
    expect(TIMELINE_CATEGORY_LABELS.PROJECT).toBe("프로젝트");
    expect(TIMELINE_CATEGORY_LABELS.MILESTONE).toBe("이정표");
  });
});
