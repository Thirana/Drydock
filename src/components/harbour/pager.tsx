import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/icons";

interface Target {
  href: string;
  label: string;
  /** A numeral or ID set before the label. */
  mark?: string;
}

/**
 * The pages either side of this one, so the case study reads start to finish.
 * The next page is the big one, with a line saying what it holds.
 */
export function Pager({
  prev,
  next,
  end,
  note,
}: {
  prev?: Target;
  next?: Target & { description?: string };
  /** Said instead of a next page. */
  end?: ReactNode;
  /** A quiet line under the previous link. */
  note?: string;
}) {
  return (
    <nav
      aria-label="Pages"
      className="mx-auto w-full max-w-[1200px] px-5 pb-20 sm:px-8"
    >
      <div className="border-rule grid gap-8 border-t pt-8 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          {prev && (
            <Link
              href={prev.href}
              rel="prev"
              className="text-ink-muted hover:text-ink inline-flex items-center gap-2 text-[16px] transition-colors"
            >
              <IconArrowLeft size={12} />
              {prev.mark && (
                <span className="font-mono text-[14px]">{prev.mark}</span>
              )}
              {prev.label}
            </Link>
          )}
          {note && <p className="text-ink-muted text-[15px]">{note}</p>}
        </div>
        {next ? (
          <Link
            href={next.href}
            rel="next"
            className="group flex flex-col gap-1.5 sm:items-end sm:text-right"
          >
            <span className="dd-head text-accent inline-flex items-center gap-3 text-[26px] sm:text-[28px]">
              {next.mark && (
                <span className="text-ink-faint font-mono text-[20px]">
                  {next.mark}
                </span>
              )}
              {next.label}
              <IconArrowRight
                size={12}
                className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
            {next.description && (
              <span className="text-ink-body max-w-[48ch] text-[16px] leading-[1.55] text-pretty">
                {next.description}
              </span>
            )}
          </Link>
        ) : (
          end && (
            <div className="text-ink-body text-[16px] sm:text-right">{end}</div>
          )
        )}
      </div>
    </nav>
  );
}
