import type { ReactNode } from "react";

type FieldChildProps = {
  id: string;
  name: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  children: (props: FieldChildProps) => ReactNode;
}) {
  const errorId = error?.length ? `${name}-error` : undefined;
  const hintId = hint ? `${name}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children({
        id: name,
        name,
        ...(error?.length ? { "aria-invalid": true as const } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      })}
      {hint ? (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
      {error?.length ? (
        <p id={errorId} role="alert" className="text-xs text-red-500">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}
