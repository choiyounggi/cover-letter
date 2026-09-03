"use client";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-60",
        className,
      )}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
