import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: vi.fn(() => [{ status: "idle" }, vi.fn(), false]) };
});

import { useActionState } from "react";
import { LinkForm } from "../LinkForm";
import type { Link } from "@/generated/prisma/client";

const link: Link = {
  id: "1",
  label: "GitHub",
  url: "https://github.com/choiyounggi",
  icon: null,
  sortOrder: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("LinkForm", () => {
  it("renders a hidden sortOrder input preserving the existing value when editing (normal)", () => {
    render(<LinkForm link={link} action={vi.fn()} />);
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("3");
  });

  it("omits the hidden sortOrder input when creating a new link (boundary)", () => {
    render(<LinkForm action={vi.fn()} />);
    expect(document.querySelector('input[name="sortOrder"]')).toBeNull();
  });

  it("renders 0 for a link whose sortOrder is the schema default (boundary)", () => {
    render(<LinkForm link={{ ...link, sortOrder: 0 }} action={vi.fn()} />);
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("0");
  });

  it("keeps the hidden sortOrder value and surfaces a field error when the action fails (error)", () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      { status: "error", fieldErrors: { label: ["필수 입력이에요"] } },
      vi.fn(),
      false,
    ]);
    render(<LinkForm link={link} action={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("필수 입력이에요");
    const hidden = document.querySelector('input[name="sortOrder"]') as HTMLInputElement;
    expect(hidden.value).toBe("3");
  });
});
