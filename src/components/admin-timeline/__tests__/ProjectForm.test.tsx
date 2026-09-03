import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: vi.fn(() => [{ status: "idle" }, vi.fn(), false]) };
});

import { useActionState } from "react";
import { ProjectForm } from "../ProjectForm";
import type { Project } from "@/generated/prisma/client";

const project: Project = {
  id: "1",
  title: "Portfolio",
  summary: "A portfolio site",
  description: "",
  techStack: [],
  repoUrl: null,
  liveUrl: null,
  imageUrl: null,
  startDate: null,
  endDate: null,
  featured: false,
  sortOrder: 7,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ProjectForm", () => {
  it("renders a hidden sortOrder input preserving the existing value when editing (normal)", () => {
    render(<ProjectForm project={project} action={vi.fn()} />);
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("7");
  });

  it("omits the hidden sortOrder input when creating a new project (boundary)", () => {
    render(<ProjectForm action={vi.fn()} />);
    expect(document.querySelector('input[name="sortOrder"]')).toBeNull();
  });

  it("renders 0 for a project whose sortOrder is the schema default (boundary)", () => {
    render(<ProjectForm project={{ ...project, sortOrder: 0 }} action={vi.fn()} />);
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("0");
  });

  it("keeps the hidden sortOrder value and surfaces a field error when the action fails (error)", () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      { status: "error", fieldErrors: { title: ["필수 입력이에요"] } },
      vi.fn(),
      false,
    ]);
    render(<ProjectForm project={project} action={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("필수 입력이에요");
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("7");
  });
});
