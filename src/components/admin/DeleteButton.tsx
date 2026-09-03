"use client";
import { useActionState } from "react";
import type { ActionState } from "@/app/actions/admin/_helpers";

export function DeleteButton({
  action,
  id,
  label,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  id: string;
  label: string;
}) {
  const [, formAction] = useActionState(action, { status: "idle" });
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`${label}을(를) 삭제할까요?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-red-500 hover:underline">
        삭제
      </button>
    </form>
  );
}
