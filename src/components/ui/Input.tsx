import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
}

function FieldLabel({ label, required, htmlFor }: Omit<FieldWrapperProps, "error" | "hint">) {
  if (!label) return null;
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-0.5 text-danger-ink">*</span>}
    </label>
  );
}

function FieldMessage({ error, hint }: Pick<FieldWrapperProps, "error" | "hint">) {
  if (error) return <p className="mt-1.5 text-sm text-danger-ink">{error}</p>;
  if (hint) return <p className="mt-1.5 text-sm text-slate-500">{hint}</p>;
  return null;
}

const baseFieldClasses =
  "w-full rounded-md border border-line bg-paper-0 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100 disabled:bg-paper-100 disabled:text-slate-400";

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, id, className, ...props }, ref) => (
    <div>
      <FieldLabel label={label} required={required} htmlFor={id} />
      <input
        ref={ref}
        id={id}
        className={clsx(baseFieldClasses, error && "border-danger-ink focus:ring-danger-bg", className)}
        {...props}
      />
      <FieldMessage error={error} hint={hint} />
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapperProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, id, className, ...props }, ref) => (
    <div>
      <FieldLabel label={label} required={required} htmlFor={id} />
      <textarea
        ref={ref}
        id={id}
        className={clsx(baseFieldClasses, "resize-y", error && "border-danger-ink focus:ring-danger-bg", className)}
        {...props}
      />
      <FieldMessage error={error} hint={hint} />
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldWrapperProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, id, className, children, ...props }, ref) => (
    <div>
      <FieldLabel label={label} required={required} htmlFor={id} />
      <select
        ref={ref}
        id={id}
        className={clsx(baseFieldClasses, "cursor-pointer bg-paper-0", error && "border-danger-ink", className)}
        {...props}
      >
        {children}
      </select>
      <FieldMessage error={error} hint={hint} />
    </div>
  )
);
Select.displayName = "Select";
