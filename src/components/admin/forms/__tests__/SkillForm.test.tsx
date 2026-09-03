import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: vi.fn(() => [{ status: "idle" }, vi.fn(), false]) };
});

import { useActionState } from "react";
import { SkillForm } from "../SkillForm";
import type { Skill } from "@/generated/prisma/client";

const skill: Skill = {
  id: "1",
  name: "TypeScript",
  category: "FRONTEND",
  level: 4,
  icon: null,
  sortOrder: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("SkillForm", () => {
  it("renders a hidden sortOrder input preserving the existing value when editing (normal)", () => {
    render(<SkillForm skill={skill} action={vi.fn()} />);
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("5");
  });

  it("omits the hidden sortOrder input when creating a new skill (boundary)", () => {
    render(<SkillForm action={vi.fn()} />);
    expect(document.querySelector('input[name="sortOrder"]')).toBeNull();
  });

  it("renders 0 for a skill whose sortOrder is the schema default (boundary)", () => {
    render(<SkillForm skill={{ ...skill, sortOrder: 0 }} action={vi.fn()} />);
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("0");
  });

  it("keeps the hidden sortOrder value and surfaces a field error when the action fails (error)", () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      { status: "error", fieldErrors: { name: ["필수 입력이에요"] } },
      vi.fn(),
      false,
    ]);
    render(<SkillForm skill={skill} action={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("필수 입력이에요");
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("5");
  });
});
