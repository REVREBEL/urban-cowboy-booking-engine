import React from "react";

type FormFieldProps = {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
};

export const FormField = ({ label, helperText, error, id, children }: FormFieldProps) => {
  const helperId = id ? `${id}-helper` : undefined;
  const errorId = id ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-ap-2">
      {label ? (
        <label htmlFor={id} className="font-ap-sans text-ap-sm text-ap-text-primary">
          {label}
        </label>
      ) : null}
      {children}
      {helperText ? (
        <p id={helperId} className="font-ap-sans text-ap-xs text-ap-text-muted">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="font-ap-sans text-ap-xs text-ap-status-danger-text">
          {error}
        </p>
      ) : null}
    </div>
  );
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, suffix, className = "", ...props }, ref) => (
    <div className="flex items-center gap-ap-2 rounded-ap-md border border-ap-border-subtle bg-ap-bg-surface px-ap-3 py-2 focus-within:outline focus-within:outline-2 focus-within:outline-ap-accent-focus">
      {prefix ? <span className="text-ap-text-muted">{prefix}</span> : null}
      <input
        ref={ref}
        className={`w-full bg-transparent font-ap-sans text-ap-base text-ap-text-primary placeholder:text-ap-text-muted focus:outline-none ${className}`.trim()}
        {...props}
      />
      {suffix ? <span className="text-ap-text-muted">{suffix}</span> : null}
    </div>
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`w-full rounded-ap-md border border-ap-border-subtle bg-ap-bg-surface px-ap-3 py-2 font-ap-sans text-ap-base text-ap-text-primary placeholder:text-ap-text-muted focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ap-accent-focus ${className}`.trim()}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`h-10 w-full rounded-ap-md border border-ap-border-subtle bg-ap-bg-surface px-ap-3 font-ap-sans text-ap-base text-ap-text-primary focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ap-accent-focus ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode };

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => (
    <label className="inline-flex items-center gap-ap-2 font-ap-sans text-ap-base text-ap-text-primary">
      <input
        ref={ref}
        type="checkbox"
        className={`size-4 rounded-ap-xs border border-ap-border-subtle accent-ap-accent-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-ap-accent-focus ${className}`.trim()}
        {...props}
      />
      {label}
    </label>
  )
);
Checkbox.displayName = "Checkbox";

export const Radio = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => (
    <label className="inline-flex items-center gap-ap-2 font-ap-sans text-ap-base text-ap-text-primary">
      <input
        ref={ref}
        type="radio"
        className={`size-4 rounded-ap-full border border-ap-border-subtle accent-ap-accent-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-ap-accent-focus ${className}`.trim()}
        {...props}
      />
      {label}
    </label>
  )
);
Radio.displayName = "Radio";

type SwitchProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode };

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = "", ...props }, ref) => (
    <label className="inline-flex items-center gap-ap-2 font-ap-sans text-ap-base text-ap-text-primary">
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className={`h-5 w-9 rounded-ap-full border border-ap-border-subtle bg-ap-bg-surface-subtle accent-ap-accent-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-ap-accent-focus ${className}`.trim()}
        {...props}
      />
      {label}
    </label>
  )
);
Switch.displayName = "Switch";
