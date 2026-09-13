"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface Chapter {
  id: string;
  label: string;
  /** The end state: progress turns sage once the reader gets here. */
  healthy?: boolean;
}

/** Where the reader is in the page's walk from as found to healthy. */
export function ChapterMarker({
  chapters,
  variant,
}: {
  chapters: Chapter[];
  /** `rail` sits beside the chapters on large screens; `bar` floats at the bottom below that. */
  variant: "rail" | "bar";
}) {
  const active = useActiveChapter(chapters);
  const current = chapters[active];
  const done = !!current?.healthy;
  const reachedTone = done ? "bg-gl-success" : "bg-gl-primary";

  if (variant === "rail") {
    return (
      <nav aria-label="Page chapters" className="sticky top-28">
        <ol>
          {chapters.map((chapter, i) => {
            const reached = i <= active;
            return (
              <li key={chapter.id} className="relative">
                {i < chapters.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-[calc(50%+5.5px)] left-[5px] h-[calc(100%-11px)] w-px transition-colors duration-300",
                      i < active ? reachedTone : "bg-gl-border",
                    )}
                  />
                )}
                <a
                  href={`#${chapter.id}`}
                  aria-current={i === active ? "location" : undefined}
                  className="group flex min-h-11 items-center gap-3"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative size-[11px] shrink-0 rounded-full border-2 transition-colors duration-300",
                      reached
                        ? done
                          ? "border-gl-success bg-gl-success"
                          : "border-gl-primary bg-gl-primary"
                        : "border-gl-border-input bg-gl-bg",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[13px] transition-colors duration-300",
                      i === active
                        ? "text-gl-text font-semibold"
                        : "text-gl-text-muted group-hover:text-gl-text font-medium",
                    )}
                  >
                    {chapter.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  const next = chapters[active + 1];
  const visible = active >= 0;
  const segments = (
    <span aria-hidden="true" className="flex gap-1">
      {chapters.map((chapter, i) => (
        <span
          key={chapter.id}
          className={cn(
            "h-1 w-4 rounded-full transition-colors duration-300",
            i <= active ? reachedTone : "bg-gl-border",
          )}
        />
      ))}
    </span>
  );
  const pill =
    "border-gl-border bg-gl-bg/90 shadow-gl-lg flex min-h-11 items-center gap-3 rounded-full border px-4 backdrop-blur-xl";

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "sticky bottom-4 z-40 flex justify-center transition-[opacity,transform] duration-300 lg:hidden",
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      {next ? (
        <a
          href={`#${next.id}`}
          tabIndex={visible ? undefined : -1}
          aria-label={`${current?.label}. Next chapter: ${next.label}`}
          className={pill}
        >
          {segments}
          <span className="text-gl-text text-[12.5px] font-semibold">
            {current?.label}
          </span>
          <span className="text-gl-text-muted text-[12px]">
            Next: {next.label}
          </span>
        </a>
      ) : (
        <p className={pill}>
          {segments}
          <span className="text-gl-text text-[12.5px] font-semibold">
            {current?.label}
          </span>
        </p>
      )}
    </div>
  );
}

/** Index of the last chapter whose top has passed 45% of the viewport; -1 before the first. */
function useActiveChapter(chapters: Chapter[]) {
  const [active, setActive] = useState(-1);
  const ids = chapters.map((c) => c.id).join(" ");

  useEffect(() => {
    const sections = ids.split(" ").map((id) => document.getElementById(id));
    let frame = 0;
    const measure = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      const line = window.innerHeight * 0.45;
      let next = -1;
      sections.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) next = i;
      });
      setActive(atBottom && next >= 0 ? sections.length - 1 : next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);

  return active;
}
