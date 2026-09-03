"use client";
import { useActionState } from "react";
import type { ActionState } from "@/app/actions/admin/_helpers";

export function MarkReadButton({
  action,
  id,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  id: string;
}) {
  const [, formAction] = useActionState(action, { status: "idle" });
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-accent">
        읽음 처리
      </button>
    </form>
  );
}
