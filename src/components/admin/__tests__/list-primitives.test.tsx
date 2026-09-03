import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useActionState: vi.fn() };
});

import { useActionState } from "react";
import { EntityTable } from "../EntityTable";
import { ReorderList } from "../ReorderList";
import { DeleteButton } from "../DeleteButton";

describe("EntityTable", () => {
  it("renders header + cell (normal)", () => {
    render(
      <EntityTable
        columns={[{ key: "label", header: "라벨" }]}
        rows={[{ id: "1", label: "GitHub" }]}
      />,
    );
    expect(screen.getByText("라벨")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });
});

describe("ReorderList", () => {
  it("moves an item up and submits ids in the new order (normal)", () => {
    const formActionSpy = vi.fn();
    vi.mocked(useActionState).mockReturnValue([{ status: "idle" }, formActionSpy, false]);
    const items = [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
    ];
    render(<ReorderList items={items} action={vi.fn()} />);
    const upButtons = screen.getAllByRole("button", { name: "위로" });
    fireEvent.click(upButtons[1]);
    const hidden = document.querySelector('input[name="ids"]') as HTMLInputElement;
    expect(JSON.parse(hidden.value)).toEqual(["b", "a", "c"]);
    fireEvent.submit(hidden.closest("form")!);
    expect(formActionSpy).toHaveBeenCalled();
  });

  it("disables the first item's up button (boundary)", () => {
    vi.mocked(useActionState).mockReturnValue([{ status: "idle" }, vi.fn(), false]);
    const items = [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ];
    render(<ReorderList items={items} action={vi.fn()} />);
    const upButtons = screen.getAllByRole("button", { name: "위로" });
    expect(upButtons[0]).toBeDisabled();
  });
});

describe("DeleteButton", () => {
  it("does not submit when confirm returns false (boundary)", () => {
    vi.stubGlobal("confirm", vi.fn(() => false));
    const formActionSpy = vi.fn();
    vi.mocked(useActionState).mockReturnValue([{ status: "idle" }, formActionSpy, false]);
    render(<DeleteButton action={vi.fn()} id="1" label="링크" />);
    const form = screen.getByRole("button", { name: "삭제" }).closest("form")!;
    fireEvent.submit(form);
    expect(confirm).toHaveBeenCalled();
    expect(formActionSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("submits the id when confirm returns true (normal)", () => {
    vi.stubGlobal("confirm", vi.fn(() => true));
    const formActionSpy = vi.fn();
    vi.mocked(useActionState).mockReturnValue([{ status: "idle" }, formActionSpy, false]);
    render(<DeleteButton action={vi.fn()} id="42" label="링크" />);
    const form = screen.getByRole("button", { name: "삭제" }).closest("form")!;
    const hidden = form.querySelector('input[name="id"]') as HTMLInputElement;
    expect(hidden.value).toBe("42");
    fireEvent.submit(form);
    expect(confirm).toHaveBeenCalled();
    expect(formActionSpy).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
