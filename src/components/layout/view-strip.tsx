"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ViewStripProps {
  slate: { href: string; title: string; sub: string };
  /** A frame is current on its own URL and every URL below it, unless `exact`. */
  frames: { href: string; label: string; exact?: boolean }[];
}

/** Some static hosts serve "/harbour" as "/harbour.html", or add a slash. */
const clean = (path: string) => path.replace(/(\.html|\/)$/, "") || "/";

/** A section's parts written as one line of numbered moves; the current one is blue. */
export function ViewStrip({ slate, frames }: ViewStripProps) {
  const pathname = clean(usePathname());
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the current part in sight on narrow screens.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[aria-current]")
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <div className="border-rule bg-ground/95 sticky top-0 z-30 border-b backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-5 sm:px-8">
        <Link
          href={slate.href}
          className="text-ink-muted hover:text-ink hidden shrink-0 py-3 text-[15px] transition-colors lg:block"
        >
          <span className="text-ink font-semibold">{slate.title}</span> ·{" "}
          {slate.sub}
        </Link>
        <nav aria-label={`${slate.title} sections`} className="min-w-0 flex-1">
          <ol
            ref={listRef}
            className="no-scrollbar flex gap-x-6 overflow-x-auto lg:justify-end"
          >
            {frames.map((frame, i) => {
              const exact = pathname === frame.href;
              const active =
                exact ||
                (!frame.exact && pathname.startsWith(`${frame.href}/`));
              return (
                <li key={frame.href} className="shrink-0">
                  <Link
                    href={frame.href}
                    aria-current={exact ? "page" : active ? "true" : undefined}
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
