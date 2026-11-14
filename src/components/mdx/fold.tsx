import type { ReactNode } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * One row of a toggle list: the heading and what is always worth seeing stay
 * up, the reasoning folds away. Native <details>, so the text stays in the
 * page for search and find-in-page; rows that share a `name` open one at a time.
 */
export function Fold({
  name,
  mark,
  title,
  meta,
  children,
  wideMark,
}: {
  /** Rows with the same name close each other. */
  name: string;
  /** The left column: a number, a year, an annotator's mark. */
  mark: ReactNode;
  title: string;
  /** Under the title, open or closed: links, tags. */
  meta?: ReactNode;
  children: ReactNode;
  /** The mark is a word, not a sign. */
  wideMark?: boolean;
}) {
  const grid = wideMark
    ? "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[96px_minmax(0,1fr)_auto]"
    : "grid-cols-[30px_minmax(0,1fr)_auto]";
  return (
    <details
      name={name}
      className="group border-rule open:border-l-accent border-b border-l-2 border-l-transparent transition-colors duration-300"
    >
      <summary
        className={cn(
          "hover:bg-sunk/60 grid cursor-pointer list-none items-start gap-x-3 py-4 pr-2 pl-4 transition-colors duration-150 [&::-webkit-details-marker]:hidden",
          grid,
        )}
      >
        <span
          className={cn(
            "group-open:text-accent pt-[3px] transition-colors",
            wideMark
              ? "text-ink-muted col-span-2 text-[14px] font-semibold sm:col-span-1"
              : "text-ink font-mono text-[16px] font-bold",
          )}
        >
          {mark}
        </span>
        <span className="min-w-0">
          <h3 className="text-ink text-[19px] leading-[1.35] font-bold text-balance">
            {title}
          </h3>
          {meta && <span className="mt-1.5 block">{meta}</span>}
        </span>
        <IconChevronDown
          size={14}
          className={cn(
            "text-ink-muted mt-2 transition-transform duration-200 group-open:rotate-180",
            wideMark && "col-start-2 row-start-2 sm:col-start-3 sm:row-start-1",
          )}
        />
      </summary>
      <div
        className={cn(
          "text-ink-body [&_code]:bg-sunk max-w-[66ch] pr-2 pb-6 pl-4 text-[17px] leading-[1.62] text-pretty [&_code]:rounded-[2px] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.86em]",
          wideMark ? "sm:pl-[124px]" : "sm:pl-[58px]",
        )}
      >
        {children}
      </div>
    </details>
  );
}

/** A toggle list's frame: the rule above the first row. */
export function Folds({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose border-rule my-8 max-w-[860px] border-t">
      {children}
    </div>
  );
}
