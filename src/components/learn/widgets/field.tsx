"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** A labelled text input for addresses and numbers: mono, so 0 and O never mix. */
export function Field({
  label,
  value,
  onChange,
  invalid,
  describedBy,
  short,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  short?: boolean;
  inputMode?: "text" | "numeric";
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-ink-muted text-[14px]">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? describedBy : undefined}
        className={cn(
          "bg-ground text-ink h-11 rounded-[2px] border px-3 font-mono text-[16px] transition-colors",
          invalid
            ? "border-fault"
            : "border-rule-strong hover:border-ink-faint",
          short ? "w-[96px]" : "w-[210px]",
        )}
      />
    </div>
  );
}

/** Why the input cannot be used, said plainly, with how to fix it. */
export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="text-fault text-[15px] leading-[1.5]">
      {children}
    </p>
  );
}
