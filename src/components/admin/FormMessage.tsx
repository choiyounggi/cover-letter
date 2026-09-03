import { cn } from "@/lib/utils";
import type { ActionState } from "@/app/actions/admin/_helpers";

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={cn("text-sm", state.status === "ok" ? "text-accent" : "text-red-500")}
    >
      {state.message}
    </p>
  );
}
