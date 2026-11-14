import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The top of every case study page: a small line saying where you are, the
 * title, the lead, and anything the page adds under them. An aside sits to
 * the right from 1024px.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  aside,
  asideClassName,
  large,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  /** Sizes the aside from 1024px; 400px wide by default. */
  asideClassName?: string;
  /** The section's front page: a bigger title. */
  large?: boolean;
}) {
  return (
    <header className="mx-auto grid w-full max-w-[1200px] items-start gap-x-16 gap-y-10 px-5 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,auto)]">
      <div className="max-w-[760px] min-w-0">
        {eyebrow && (
          <p className="text-ink-muted mb-3 text-[15px] font-semibold">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "dd-head animate-rise text-ink text-balance",
            large
              ? "text-[52px] sm:text-[64px] lg:text-[72px]"
              : "text-[36px] sm:text-[46px]",
          )}
        >
          {title}
        </h1>
        {lead && (
          <div className="text-ink-body mt-4 text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
            {lead}
          </div>
        )}
        {children}
      </div>
      {aside && (
        <div className={cn("min-w-0 lg:w-[400px]", asideClassName)}>
          {aside}
        </div>
      )}
    </header>
  );
}
