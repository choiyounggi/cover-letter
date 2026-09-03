import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const fieldClass = "w-full rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-3 py-2 text-sm text-fg outline-none focus:border-accent";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input type="text" className={cn(fieldClass, className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldClass, "min-h-32", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(fieldClass, className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ className, ...props }: ComponentProps<"input">) {
  return <input type="checkbox" className={cn("h-4 w-4 rounded border-border accent-accent", className)} {...props} />;
}

export function TagsInput({ className, ...props }: ComponentProps<"input">) {
  return <input type="text" className={cn(fieldClass, className)} {...props} />;
}
