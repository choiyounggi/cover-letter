import { describe, it, expect } from "vitest";
import { groupEventsByYear } from "../group-by-year";

describe("groupEventsByYear", () => {
  it("groups events by UTC year, years descending (normal)", () => {
    const events = [
      { id: "a", date: new Date("2020-01-01T00:00:00Z") },
      { id: "b", date: new Date("2022-06-01T00:00:00Z") },
      { id: "c", date: new Date("2021-03-01T00:00:00Z") },
    ];
    expect(groupEventsByYear(events)).toEqual([
      [2022, [events[1]]],
      [2021, [events[2]]],
      [2020, [events[0]]],
    ]);
  });

  it("returns an empty array for no events (boundary)", () => {
    expect(groupEventsByYear([])).toEqual([]);
  });

  it("keeps two same-year events in a single group, in input order (boundary)", () => {
    const events = [
      { id: "a", date: new Date("2021-01-01T00:00:00Z") },
      { id: "b", date: new Date("2021-11-30T23:30:00Z") },
    ];
    expect(groupEventsByYear(events)).toEqual([[2021, [events[0], events[1]]]]);
  });

  it("uses the UTC year even for a late-UTC-day timestamp that falls on the next local day (boundary)", () => {
    // 2021-12-31T23:30:00Z is already 2022-01-01 in KST (UTC+9); getUTCFullYear() must still say 2021.
    const events = [{ id: "a", date: new Date("2021-12-31T23:30:00Z") }];
    expect(groupEventsByYear(events)).toEqual([[2021, [events[0]]]]);
  });
});
