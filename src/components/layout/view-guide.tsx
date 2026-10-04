import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A track's views as numbered moves, each with the question it answers. */
export function ViewGuide({
  children,
  columns = 1,
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "not-prose my-8 grid max-w-[760px] grid-cols-1",
        columns === 2 && "lg:max-w-none lg:grid-cols-2 lg:gap-x-12",
        className,
      )}
    >
      {children}
    </ol>
  );
}

export function ViewGuideItem({
  href,
  title,
  frame,
  children,
}: {
  href: string;
  title: string;
  /** Position of the view in its track, from 1. */
  frame?: number;
  children: ReactNode;
}) {
  return (
    <li className="border-rule border-t">
      <Link
        href={href}
        className="group grid grid-cols-[36px_minmax(0,1fr)] items-baseline gap-x-2 py-4"
      >
        <span className="text-ink-faint group-hover:text-accent font-mono text-[15px] font-bold transition-colors">
          {frame !== undefined ? `${frame}.` : ""}
        </span>
        <span className="min-w-0">
          <span className="text-accent decoration-accent/40 block text-[19px] font-bold underline decoration-[1.5px] underline-offset-4 transition-colors group-hover:decoration-current">
            {title}
          </span>
          <span className="text-ink-body mt-1 block text-[16px] leading-[1.55] text-pretty">
            {children}
          </span>
        </span>
      </Link>
    </li>
  );
}
