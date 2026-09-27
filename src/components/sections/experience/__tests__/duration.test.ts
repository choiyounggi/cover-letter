import { describe, expect, it } from "vitest";
import { monthsBetween } from "../duration";

describe("monthsBetween", () => {
  it("counts inclusive UTC calendar months between two dates (normal)", () => {
    expect(
      monthsBetween(
        new Date("2021-01-01T00:00:00Z"),
        new Date("2021-12-01T00:00:00Z"),
        new Date("2022-01-01T00:00:00Z"),
      ),
    ).toBe(12);
  });

  it("counts the same month as 1 (boundary: inclusive single-month range)", () => {
    expect(
      monthsBetween(
        new Date("2021-01-01T00:00:00Z"),
        new Date("2021-01-28T00:00:00Z"),
        new Date("2022-01-01T00:00:00Z"),
      ),
    ).toBe(1);
  });

  it("returns 0 when end precedes start (error)", () => {
    expect(
      monthsBetween(
        new Date("2021-03-01T00:00:00Z"),
        new Date("2021-01-01T00:00:00Z"),
        new Date("2022-01-01T00:00:00Z"),
      ),
    ).toBe(0);
  });

  it("falls back to now when end is null (boundary: open-ended experience)", () => {
    expect(monthsBetween(new Date("2021-01-01T00:00:00Z"), null, new Date("2021-06-15T00:00:00Z"))).toBe(6);
  });
});
