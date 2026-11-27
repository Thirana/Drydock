"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

export interface RoutePart {
  id: string;
  title: string;
  /** "chapter 0", "chapters 1-10". */
  range: string;
  /** Published chapters in the part, by slug. */
  chapters: string[];
  minutes: number;
}

/**
 * The course as a route beside its chapter list: a stop per part, the part
 * on screen in blue, and how much of each part this reader has opened. The
 * numbers match the marks on the course drawing.
 */
export function CourseRoute({
  course,
  parts,
}: {
  course: string;
  parts: RoutePart[];
}) {
  const [at, setAt] = useState(0);
  const progress = useProgress();
  const opened = new Set(progress?.[course]?.opened ?? []);

  // The part whose heading has passed a line a third of the way down.
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.34;
      let current = 0;
      parts.forEach((p, i) => {
        const el = document.getElementById(`part-${p.id}`);
        if (el && el.getBoundingClientRect().top < line) current = i;
      });
      setAt(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [parts]);

  return (
    <nav aria-label="Parts of this course">
      <p className="text-ink-muted text-[14px] font-semibold">
        The route through this course
      </p>
      <ol className="mt-5">
        {parts.map((p, i) => {
          const current = i === at;
          const passed = i < at;
          const done = p.chapters.filter((slug) => opened.has(slug)).length;
          const last = i === parts.length - 1;
          return (
            <li
              key={p.id}
              className="relative grid grid-cols-[28px_1fr] gap-x-3.5"
            >
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-8 bottom-1 left-[13.5px] w-px transition-colors duration-300",
                    passed ? "bg-accent" : "bg-rule-strong",
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative grid size-7 place-items-center rounded-full border font-mono text-[13px] font-bold transition-colors duration-300",
                  current
                    ? "border-accent bg-accent text-accent-ink"
                    : passed
                      ? "border-accent bg-ground text-accent"
                      : "border-ink-faint bg-ground text-ink-muted",
                )}
              >
                {i}
              </span>
              <a
                href={`#part-${p.id}`}
                aria-current={current ? "location" : undefined}
                className={cn("group block pt-[3px]", !last && "pb-6")}
              >
                <span
                  className={cn(
                    "block text-[15.5px] leading-[1.3] font-semibold transition-colors",
                    current
                      ? "text-accent"
                      : "text-ink group-hover:text-accent",
                  )}
                >
                  {p.title}
                </span>
                <span className="text-ink-muted mt-1 block font-mono text-[12.5px]">
                  {p.range} ·{" "}
                  {done
                    ? `${done} of ${p.chapters.length} opened`
                    : `${p.minutes} min`}
                </span>
                {p.chapters.length > 1 && done > 0 && (
                  <span
                    aria-hidden="true"
                    className="bg-rule mt-2 block h-[3px] w-full max-w-[160px] overflow-hidden rounded-full"
                  >
                    <span
                      className="bg-accent block h-full"
                      style={{ width: `${(done / p.chapters.length) * 100}%` }}
                    />
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
