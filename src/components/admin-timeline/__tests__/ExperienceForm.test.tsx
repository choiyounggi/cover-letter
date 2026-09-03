import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: vi.fn(() => [{ status: "idle" }, vi.fn(), false]) };
});

import { useActionState } from "react";
import { ExperienceForm } from "../ExperienceForm";
import type { Experience } from "@/generated/prisma/client";

const experience: Experience = {
  id: "1",
  companyId: "c1",
  role: "Backend Engineer",
  startDate: new Date("2021-07-01T00:00:00.000Z"),
  endDate: null,
  summary: "",
  achievements: [],
  techStack: [],
  sortOrder: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ExperienceForm", () => {
  it("renders a hidden sortOrder input preserving the existing value when editing (normal)", () => {
    render(<ExperienceForm experience={experience} companies={[{ id: "c1", name: "Acme" }]} action={vi.fn()} />);
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("4");
  });

  it("omits the hidden sortOrder input when creating a new experience (boundary)", () => {
    render(<ExperienceForm companies={[{ id: "c1", name: "Acme" }]} action={vi.fn()} />);
    expect(document.querySelector('input[name="sortOrder"]')).toBeNull();
  });

  it("renders 0 for an experience whose sortOrder is the schema default (boundary)", () => {
    render(
      <ExperienceForm
        experience={{ ...experience, sortOrder: 0 }}
        companies={[{ id: "c1", name: "Acme" }]}
        action={vi.fn()}
      />,
    );
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("0");
  });

  it("keeps the hidden sortOrder value and surfaces a field error when the action fails (error)", () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      { status: "error", fieldErrors: { role: ["필수 입력이에요"] } },
      vi.fn(),
      false,
    ]);
    render(<ExperienceForm experience={experience} companies={[{ id: "c1", name: "Acme" }]} action={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("필수 입력이에요");
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("4");
  });
});
