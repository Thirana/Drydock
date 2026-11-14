"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconCheck } from "@/components/ui/icons";
import { useHarbourState } from "@/hooks/use-harbour-state";
import { cn } from "@/lib/utils";
import { DefectDrawing } from "./defect-drawings";
import { DrawingKey } from "./drawing-key";
import { StateSwitch } from "./state-switch";

/**
 * A defect page's body: its own drawing, as found or with only this defect
 * closed, then the notes beside the change itself. Once the drawing scrolls
 * away, a small copy of it joins the change, so a note and the picture it
 * talks about stay on screen together.
 */
export function DefectView({
  id,
  before,
  after,
  children,
}: {
  id: string;
  before: string;
  after: string;
  /** The notes: a toggle list rendered on the server. */
  children: ReactNode;
}) {
  const [state, setState] = useHarbourState();
  const fixed = state === "fixed";
  const figureRef = useRef<HTMLDivElement>(null);
  const [figureInView, setFigureInView] = useState(true);

  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFigureInView(entry.intersectionRatio >= 0.6),
      { threshold: [0, 0.6, 1], rootMargin: "-49px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A link to a note (from search, or shared) opens it.
  useEffect(() => {
    const reveal = () => {
      const target = location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null;
      const note = target?.closest("details");
      if (!note) return;
      note.open = true;
      target?.scrollIntoView({ block: "start" });
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
      <figure data-pagefind-ignore className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-3">
          <StateSwitch
            value={state}
            onChange={setState}
            fixedLabel={`${id} fixed`}
          />
          <DrawingKey />
        </div>
        <div
          ref={figureRef}
          className="dd-fig border-rule bg-ground overflow-x-auto rounded-[2px] border p-4 sm:p-5"
        >
          <DefectDrawing id={id} fixed={fixed} />
        </div>
        <figcaption className="mt-3 space-y-2">
          <p className="text-ink-muted max-w-[72ch] text-[15px] leading-[1.55] text-pretty">
            Only what {id} touches. Red is the defect and what it lets through;
            switch to fixed to see the same parts with only {id} closed. Struck
            IDs are closed.
          </p>
          <ChangeLine
            className="lg:hidden"
            fixed={fixed}
            before={before}
            after={after}
          />
          <p className="text-ink-muted text-[14px] md:hidden">
            Wide by design - scroll it sideways.
          </p>
        </figcaption>
      </figure>

      <div className="mt-12 grid gap-x-14 pb-20 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">{children}</div>
        <aside aria-label="The change" className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100dvh-80px)] overflow-y-auto pt-1 pb-2">
            {!figureInView && (
              <div className="animate-fade-in mb-6" aria-hidden="true">
                <p className="dd-label text-ink-muted">The drawing</p>
                <div className="dd-fig dd-mini border-rule bg-ground mt-2 rounded-[2px] border p-2.5">
                  <DefectDrawing id={id} fixed={fixed} mini />
                </div>
              </div>
            )}
            <Change fixed={fixed} before={before} after={after} />
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Both settings, the one the drawing shows in full ink. */
function Change({
  fixed,
  before,
  after,
}: {
  fixed: boolean;
  before: string;
  after: string;
}) {
  return (
    <div className="border-ink border-t-2 pt-3">
      <p className="dd-label text-ink-muted">The change</p>
      <dl className="mt-3 space-y-4">
        <div
          className={cn(
            "border-l-2 pl-3 transition-opacity duration-300",
            fixed ? "border-l-rule opacity-55" : "border-l-fault",
          )}
        >
          <dt className="dd-label text-fault">As found</dt>
          <dd className="text-ink mt-1 text-[15px] leading-[1.5]">{before}</dd>
        </div>
        <div
          className={cn(
            "border-l-2 pl-3 transition-opacity duration-300",
            fixed ? "border-l-green" : "border-l-rule opacity-55",
          )}
        >
          <dt className="dd-label text-green inline-flex items-center gap-1.5">
            <IconCheck size={11} /> Fixed
          </dt>
          <dd className="text-ink mt-1 text-[15px] leading-[1.5]">{after}</dd>
        </div>
      </dl>
    </div>
  );
}

/** The setting the drawing shows, for screens without the side column. */
function ChangeLine({
  fixed,
  before,
  after,
  className,
}: {
  fixed: boolean;
  before: string;
  after: string;
  className?: string;
}) {
  return (
    <p
      key={String(fixed)}
      className={cn(
        "animate-fade-in grid max-w-[68ch] grid-cols-[76px_minmax(0,1fr)] items-baseline gap-x-3",
        className,
      )}
    >
      <span
        className={cn(
          "dd-label inline-flex items-center gap-1.5",
          fixed ? "text-green" : "text-fault",
        )}
      >
        {fixed && <IconCheck size={11} />}
        {fixed ? "Fixed" : "As found"}
      </span>
      <span className="text-ink text-[16px] leading-[1.55]">
        {fixed ? after : before}
      </span>
    </p>
  );
}
