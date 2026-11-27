"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Stop {
  id: string;
  title: string;
}

/**
 * "On this page" as a route: a stop per section heading in `container`, the
 * section on screen in blue and the ones above it passed. Built from the
 * rendered headings, so the page's content stays the only source.
 */
export function PageRoute({ container }: { container: string }) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const root = document.getElementById(container);
    if (!root) return;
    const headings = [...root.querySelectorAll<HTMLHeadingElement>("h2[id]")];

    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = 0;
      headings.forEach((h, i) => {
        if (h.getBoundingClientRect().top < line) current = i;
      });
      setAt(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    // The headings are read after the first paint, then followed on scroll.
    frame = requestAnimationFrame(() => {
      setStops(
        headings.map((h) => ({ id: h.id, title: h.textContent ?? "" })),
      );
      read();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [container]);

  if (!stops.length) return null;

  return (
    <nav aria-label="On this page" className="animate-fade-in">
      <p className="text-ink-muted text-[14px] font-semibold">On this page</p>
      <ol className="mt-4">
        {stops.map((s, i) => {
          const current = i === at;
          const passed = i < at;
          const last = i === stops.length - 1;
          return (
            <li
              key={s.id}
              className="relative grid grid-cols-[14px_1fr] gap-x-3"
            >
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[18px] bottom-0 left-[6.5px] w-px transition-colors duration-300",
                    passed ? "bg-accent" : "bg-rule-strong",
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative mt-[7px] size-3.5 rounded-full border transition-colors duration-300",
                  current
                    ? "border-accent bg-accent"
                    : passed
                      ? "border-accent bg-ground"
                      : "border-ink-faint bg-ground",
                )}
              />
              <a
                href={`#${s.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "block pb-4 text-[15px] leading-[1.4] transition-colors",
                  current
                    ? "text-accent font-semibold"
                    : "text-ink-body hover:text-accent",
                )}
              >
                {s.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
