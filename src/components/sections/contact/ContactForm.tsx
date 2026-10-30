"use client";

import { type ChangeEvent, type FormEvent, startTransition, useActionState, useState } from "react";
import { Magnetic } from "@/components/motion";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { CONTACT_CONTENT_MAX } from "@/lib/schemas/messages";
import { cn } from "@/lib/utils";
import { EMAIL_DOMAINS, composeEmail, emailPartsError, splitEmail } from "./email-parts";

const initialState: ContactState = { status: "idle" };

const inputClassName = cn(
  "w-full rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-4 py-3 font-mono text-sm",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
);

type FieldValues = { name: string; emailLocal: string; emailDomain: string; domainPreset: string; content: string };

const EMPTY_VALUES: FieldValues = { name: "", emailLocal: "", emailDomain: "", domainPreset: "", content: "" };

function isPresetDomain(domain: string): boolean {
  return (EMAIL_DOMAINS as readonly string[]).includes(domain);
}

export function ContactForm(): React.JSX.Element {
  // Fields are controlled and submitted by hand (onSubmit → formAction), so React never
  // auto-resets the form: typed input survives an error and is cleared only on success.
  const [values, setValues] = useState<FieldValues>(EMPTY_VALUES);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(async (prev: ContactState, formData: FormData) => {
    const next = await submitContact(prev, formData);
    if (next.status === "ok") setValues(EMPTY_VALUES);
    return next;
  }, initialState);

  const set = (field: "name" | "emailDomain" | "content") => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // maxLength only limits typing; a value set by script or autofill can still run past it.
    const value = field === "content" ? e.target.value.slice(0, CONTACT_CONTENT_MAX) : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (field === "emailDomain") setEmailError(null);
  };

  const handleEmailLocal = (e: ChangeEvent<HTMLInputElement>) => {
    const split = splitEmail(e.target.value);
    setValues((v) =>
      split
        ? { ...v, emailLocal: split.local, emailDomain: split.domain, domainPreset: isPresetDomain(split.domain) ? split.domain : "" }
        : { ...v, emailLocal: e.target.value },
    );
    setEmailError(null);
  };

  const handleDomainPreset = (e: ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value;
    setValues((v) => ({ ...v, domainPreset: preset, emailDomain: preset }));
    setEmailError(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = emailPartsError(values.emailLocal, values.emailDomain);
    setEmailError(error);
    if (error) return;
    const formData = new FormData(e.currentTarget);
    formData.set("email", composeEmail(values.emailLocal, values.emailDomain));
    startTransition(() => formAction(formData));
  };

  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const emailMessage = emailError ?? errors?.email?.[0];
  const contentDescribedBy = errors?.content ? "contact-content-count contact-content-error" : "contact-content-count";

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6" noValidate>
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
          value={values.name}
          onChange={set("name")}
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
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="contact-email"
            type="text"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="아이디"
            value={values.emailLocal}
            onChange={handleEmailLocal}
            aria-invalid={emailMessage ? "true" : undefined}
            aria-describedby={emailMessage ? "contact-email-error" : undefined}
            className={cn(inputClassName, "min-w-0 flex-1 basis-32")}
          />
          <span aria-hidden className="font-mono text-sm text-fg-muted">
            @
          </span>
          <input
            type="text"
            inputMode="url"
            aria-label="이메일 도메인"
            required
            maxLength={135}
            placeholder="example.com"
            value={values.emailDomain}
            onChange={set("emailDomain")}
            readOnly={values.domainPreset !== ""}
            aria-invalid={emailMessage ? "true" : undefined}
            aria-describedby={emailMessage ? "contact-email-error" : undefined}
            className={cn(inputClassName, "min-w-0 flex-1 basis-32 read-only:text-fg-muted")}
          />
          <select
            aria-label="이메일 도메인 선택"
            value={values.domainPreset}
            onChange={handleDomainPreset}
            className={cn(inputClassName, "w-full sm:w-auto")}
          >
            <option value="">직접 입력</option>
            {EMAIL_DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>
        {emailMessage && (
          <p id="contact-email-error" className="text-sm text-accent">
            {emailMessage}
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
          maxLength={CONTACT_CONTENT_MAX}
          value={values.content}
          onChange={set("content")}
          aria-invalid={errors?.content ? "true" : undefined}
          aria-describedby={contentDescribedBy}
          className={inputClassName}
        />
        <p
          id="contact-content-count"
          className={cn(
            "self-end font-mono text-xs",
            values.content.length >= CONTACT_CONTENT_MAX ? "text-accent" : "text-fg-muted",
          )}
        >
          {values.content.length}/{CONTACT_CONTENT_MAX}
        </p>
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
