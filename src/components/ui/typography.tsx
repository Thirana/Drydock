import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tiny uppercase label above stats and panel sections. */
export function Eyebrow({
  children,
  className,
  faint = false,
}: {
  children: ReactNode;
  className?: string;
  /** Faint 10px variant for use inside widgets and cards. */
  faint?: boolean;
}) {
  return (
    <p
      className={cn(
        "font-bold tracking-[0.12em] uppercase",
        faint
          ? "text-gl-text-faint text-[10px]"
          : "text-gl-text-muted text-[11px]",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** In-app section header: accent bar · title · extending rule · right slot. */
export function SectionHeader({
  children,
  right,
  className,
}: {
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-center gap-4", className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          aria-hidden="true"
          className="bg-gl-primary h-[18px] w-[3px] shrink-0 rounded-full"
        />
        <h2 className="text-gl-text text-[15px] font-bold tracking-[-0.015em] text-balance">
          {children}
        </h2>
      </div>
      <div
        aria-hidden="true"
        className="border-gl-border min-w-0 flex-1 border-t"
      />
      {right}
    </div>
  );
}

export function CheckBullet({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-gl-primary-soft text-gl-primary inline-flex size-[18px] shrink-0 items-center justify-center rounded-full",
        className,
      )}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 7.5l3 3 6-7" />
      </svg>
    </span>
  );
}
