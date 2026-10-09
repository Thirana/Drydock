"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A sideways-scrolling box that says so - but only when its content really is
 * wider than the box, so a narrow table never carries a stray note.
 */
export function ScrollX({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setWide(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={ref} className={cn("overflow-x-auto", className)}>
        {children}
      </div>
      {wide && (
        <p className="not-prose text-ink-muted mt-2 text-[14px]">
          Wide by design - scroll it sideways.
        </p>
      )}
    </>
  );
}
