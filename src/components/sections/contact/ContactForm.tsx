"use client";

import { type FormEvent, useActionState, useEffect, useRef } from "react";
import { Magnetic } from "@/components/motion";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { cn } from "@/lib/utils";

const initialState: ContactState = { status: "idle" };

const inputClassName = cn(
  "w-full rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-4 py-3 font-mono text-sm",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
);

type FieldValues = { name: string; email: string; content: string };

function readFieldValues(form: HTMLFormElement): FieldValues {
  return {
    name: (form.elements.namedItem("name") as HTMLInputElement | null)?.value ?? "",
    email: (form.elements.namedItem("email") as HTMLInputElement | null)?.value ?? "",
    content: (form.elements.namedItem("content") as HTMLTextAreaElement | null)?.value ?? "",
  };
}

export function ContactForm(): React.JSX.Element {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedValuesRef = useRef<FieldValues | null>(null);

  // React resets an uncontrolled `<form action>`'s fields after ANY completed
  // action, success or error — restore the visitor's input on error so a
  // validation mistake doesn't wipe what they typed.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    if (state.status === "ok") {
      submittedValuesRef.current = null;
      return;
    }
    if (state.status === "error" && submittedValuesRef.current) {
      const { name, email, content } = submittedValuesRef.current;
      const nameEl = form.elements.namedItem("name") as HTMLInputElement | null;
      const emailEl = form.elements.namedItem("email") as HTMLInputElement | null;
      const contentEl = form.elements.namedItem("content") as HTMLTextAreaElement | null;
      if (nameEl) nameEl.value = name;
      if (emailEl) emailEl.value = email;
      if (contentEl) contentEl.value = content;
    }
  }, [state]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    submittedValuesRef.current = readFieldValues(e.currentTarget);
  };

  const errors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="font-mono text-sm text-fg-muted">
          이름
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          maxLength={100}
          aria-invalid={errors?.name ? "true" : undefined}
          aria-describedby={errors?.name ? "contact-name-error" : undefined}
          className={inputClassName}
        />
        {errors?.name && (
          <p id="contact-name-error" className="text-sm text-accent">
            {errors.name[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="font-mono text-sm text-fg-muted">
          이메일
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={200}
          aria-invalid={errors?.email ? "true" : undefined}
          aria-describedby={errors?.email ? "contact-email-error" : undefined}
          className={inputClassName}
        />
        {errors?.email && (
          <p id="contact-email-error" className="text-sm text-accent">
            {errors.email[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-content" className="font-mono text-sm text-fg-muted">
          내용
        </label>
        <textarea
          id="contact-content"
          name="content"
          rows={6}
          required
          maxLength={5000}
          aria-invalid={errors?.content ? "true" : undefined}
          aria-describedby={errors?.content ? "contact-content-error" : undefined}
          className={inputClassName}
        />
        {errors?.content && (
          <p id="contact-content-error" className="text-sm text-accent">
            {errors.content[0]}
          </p>
        )}
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px]"
      />

      <p role="status" aria-live="polite" className="text-sm text-fg-muted">
        {state.status === "ok" && "메시지를 보냈어요. 곧 답장드릴게요."}
        {state.status === "error" && (state.message ?? "")}
      </p>

      <Magnetic className="self-start">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[var(--radius-sm)] bg-fg px-6 py-3 font-mono text-bg disabled:opacity-60"
        >
          {isPending ? "보내는 중…" : "보내기"}
        </button>
      </Magnetic>
    </form>
  );
}
