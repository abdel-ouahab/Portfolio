"use client";

import { useId, useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Field = "name" | "email" | "subject" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;
type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent" }
  | { kind: "handed-off" }
  | { kind: "failed" };

const EMPTY: Values = { name: "", email: "", subject: "", message: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Optional form backend (for example a Formspree endpoint) that accepts a JSON POST.
 * Without it, the form opens the visitor's email app with the message filled in.
 */
const endpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  else if (values.name.trim().length > 100) errors.name = "Keep your name under 100 characters.";

  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = "Enter an email address in the format name@example.com.";

  if (!values.subject.trim()) errors.subject = "Enter a subject.";
  else if (values.subject.trim().length > 150) errors.subject = "Keep the subject under 150 characters.";

  if (values.message.trim().length < 10) errors.message = "Write a message of at least 10 characters.";
  else if (values.message.length > 5000) errors.message = "Keep the message under 5,000 characters.";

  return errors;
}

export function ContactForm({ email }: { email: string }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const baseId = useId();

  function update(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (attempted) setErrors(validate(next));
    if (status.kind !== "idle" && status.kind !== "submitting") setStatus({ kind: "idle" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    const found = validate(values);
    setErrors(found);

    const firstInvalid = (Object.keys(EMPTY) as Field[]).find((field) => found[field]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
    };

    if (!endpoint) {
      const body = `${payload.message}\n\n${payload.name}\n${payload.email}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(body)}`;
      setStatus({ kind: "handed-off" });
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      setStatus({ kind: "sent" });
      setValues(EMPTY);
      setAttempted(false);
    } catch {
      setStatus({ kind: "failed" });
    }
  }

  const fieldProps = (field: Field) => ({
    id: `${baseId}-${field}`,
    name: field,
    value: values[field],
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${baseId}-${field}-error` : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field, event.target.value),
    className: cn(
      "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-base text-foreground transition-colors placeholder:text-muted/70 focus:outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20",
      errors[field] ? "border-danger" : "border-line-strong hover:border-muted",
    ),
  });

  const submitting = status.kind === "submitting";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor={`${baseId}-name`} error={errors.name} errorId={`${baseId}-name-error`}>
          <input type="text" autoComplete="name" {...fieldProps("name")} />
        </FormField>
        <FormField label="Email" htmlFor={`${baseId}-email`} error={errors.email} errorId={`${baseId}-email-error`}>
          <input type="email" autoComplete="email" inputMode="email" {...fieldProps("email")} />
        </FormField>
      </div>
      <FormField label="Subject" htmlFor={`${baseId}-subject`} error={errors.subject} errorId={`${baseId}-subject-error`}>
        <input type="text" {...fieldProps("subject")} />
      </FormField>
      <FormField label="Message" htmlFor={`${baseId}-message`} error={errors.message} errorId={`${baseId}-message-error`}>
        <textarea rows={6} {...fieldProps("message")} className={cn(fieldProps("message").className, "resize-y")} />
      </FormField>

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center">
        <Button type="submit" disabled={submitting} className="sm:w-auto">
          {submitting ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
          {endpoint ? (submitting ? "Sending…" : "Send message") : "Open in email app"}
        </Button>
        {!endpoint ? (
          <p className="text-sm text-muted">Opens your email app with this message filled in.</p>
        ) : null}
      </div>

      <div aria-live="polite" className="min-h-6">
        {status.kind === "sent" ? (
          <StatusMessage tone="success">Message sent. I&apos;ll reply to the email address you entered.</StatusMessage>
        ) : null}
        {status.kind === "handed-off" ? (
          <StatusMessage tone="success">
            Your email app should now be open with the message ready to send. If it didn&apos;t open, email{" "}
            <a href={`mailto:${email}`} className="font-medium underline underline-offset-4">
              {email}
            </a>{" "}
            directly.
          </StatusMessage>
        ) : null}
        {status.kind === "failed" ? (
          <StatusMessage tone="error">
            The message couldn&apos;t be sent. Check your connection and try again, or email{" "}
            <a href={`mailto:${email}`} className="font-medium underline underline-offset-4">
              {email}
            </a>
            .
          </StatusMessage>
        ) : null}
      </div>
    </form>
  );
}

function FormField({
  label,
  htmlFor,
  error,
  errorId,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StatusMessage({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <p className={cn("flex gap-2 text-sm leading-relaxed", tone === "error" ? "text-danger" : "text-foreground")}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone === "success" && "text-status-open")} aria-hidden />
      <span>{children}</span>
    </p>
  );
}
