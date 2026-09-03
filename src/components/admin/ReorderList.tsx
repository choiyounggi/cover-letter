"use client";
import { useActionState, useState } from "react";
import type { ActionState } from "@/app/actions/admin/_helpers";
import { SubmitButton } from "./SubmitButton";

export function ReorderList({
  items,
  action,
}: {
  items: { id: string; label: string }[];
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const itemsKey = items.map((i) => i.id).join("|");
  const [prevItemsKey, setPrevItemsKey] = useState(itemsKey);
  const [order, setOrder] = useState(() => items.map((i) => i.id));
  if (itemsKey !== prevItemsKey) {
    setPrevItemsKey(itemsKey);
    setOrder(items.map((i) => i.id));
  }
  const [, formAction] = useActionState(action, { status: "idle" });
  const byId = new Map(items.map((i) => [i.id, i]));

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="ids" value={JSON.stringify(order)} />
      {order.map((id, i) => {
        const item = byId.get(id);
        if (!item) return null;
        return (
          <div
            key={id}
            className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-3 py-2 text-sm"
          >
            <span>{item.label}</span>
            <div className="flex gap-1">
              <button type="button" aria-label="위로" disabled={i === 0} onClick={() => move(i, -1)}>
                ▲
              </button>
              <button
                type="button"
                aria-label="아래로"
                disabled={i === order.length - 1}
                onClick={() => move(i, 1)}
              >
                ▼
              </button>
            </div>
          </div>
        );
      })}
      <SubmitButton pendingText="저장 중...">순서 저장</SubmitButton>
    </form>
  );
}
