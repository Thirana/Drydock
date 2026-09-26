"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ViewStripProps {
  slate: { href: string; lab: string; track: string; provider: string };
  frames: { href: string; label: string }[];
}

/** A track's views written as one line of numbered moves; the current one is blue. */
export function ViewStrip({ slate, frames }: ViewStripProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the current view in sight on narrow screens.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[aria-current=page]")
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <div className="border-rule bg-ground/95 sticky top-0 z-30 border-b backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-5 sm:px-8">
        <Link
          href={slate.href}
          className="text-ink-muted hover:text-ink hidden shrink-0 py-3 text-[15px] transition-colors lg:block"
        >
          <span className="text-ink font-semibold">{slate.lab}</span> ·{" "}
          {slate.track}
        </Link>
        <nav aria-label="Track views" className="min-w-0 flex-1">
          <ol
            ref={listRef}
            className="no-scrollbar flex gap-x-6 overflow-x-auto lg:justify-end"
          >
            {frames.map((frame, i) => {
              const active = pathname === frame.href;
              return (
                <li key={frame.href} className="shrink-0">
                  <Link
                    href={frame.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-1.5 border-b-2 text-[15px] whitespace-nowrap transition-colors",
                      active
                        ? "border-accent text-accent font-bold"
                        : "text-ink-muted hover:text-ink border-transparent",
                    )}
                  >
                    <span className="font-mono text-[13px]">{i + 1}.</span>
                    {frame.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
