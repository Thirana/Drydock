import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** A choice set as text: the chosen one is ink and underlined in blue. */
export function ToggleChip({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 text-[15px] whitespace-nowrap underline decoration-2 underline-offset-[7px] transition-colors duration-150",
        active
          ? "text-ink decoration-accent font-semibold"
          : "text-ink-muted hover:text-ink decoration-transparent",
        className,
      )}
      {...props}
    />
  );
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** The same text choice, in a row. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "no-scrollbar flex max-w-full items-center gap-x-5 overflow-x-auto",
        className,
      )}
    >
      {options.map((option) => (
        <ToggleChip
          key={option.value}
          active={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </ToggleChip>
      ))}
    </div>
  );
}
