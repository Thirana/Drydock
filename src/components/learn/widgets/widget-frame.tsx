import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The frame every course widget sits in: a hairline, room inside, and a
 * sideways scroll for content that is wider than a phone.
 */
export function WidgetFrame({
  children,
  wide,
  label,
  className,
}: {
  children: ReactNode;
  wide?: boolean;
  /** Accessible name for the whole widget. */
  label?: string;
  className?: string;
}) {
  return (
    <figure
      aria-label={label}
      className={cn("not-prose my-10", !wide && "max-w-[760px]", className)}
    >
      <div className="border-rule bg-ground overflow-x-auto rounded-[2px] border p-4 sm:p-6">
        {children}
      </div>
    </figure>
  );
}
