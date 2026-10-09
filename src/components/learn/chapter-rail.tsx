"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconCheck, IconMenu, IconX } from "@/components/ui/icons";
import { recordVisit, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export interface RailChapter {
  num: string;
  slug: string;
  title: string;
  /** Missing while the chapter is not published yet. */
  href?: string;
  current?: boolean;
}

export interface RailPart {
  title: string;
  chapters: RailChapter[];
}

interface Section {
  id: string;
  title: string;
  /** The move numeral, or undefined for the recap sections. */
  n?: number;
}

/** The chapter's sections, read from its headings once it has rendered. */
function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const headings = [
      ...document.querySelectorAll<HTMLHeadingElement>("[data-chapter] h2[id]"),
    ];
    let n = 0;
    // Reading the rendered headings is the point: the numbering lives in CSS.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSections(
      headings.map((h) => ({
        id: h.id,
        title: h.textContent ?? "",
        n: h.dataset.section === "numbered" ? ++n : undefined,
      })),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  return { sections, active };
}

/** The sections of the current chapter, with a blue marker that slides to the one in view. */
function SectionList({
  sections,
  active,
  onNavigate,
}: {
  sections: Section[];
  active?: string;
  onNavigate?: () => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const [marker, setMarker] = useState<{ top: number; height: number }>();

  useEffect(() => {
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-id="${active}"]`,
    );
    // Measures the active row so the marker can travel to it.
    setMarker(
      item ? { top: item.offsetTop, height: item.offsetHeight } : undefined,
    );
  }, [active, sections]);

  if (!sections.length) return null;
  return (
    <ol
      ref={listRef}
      className="border-rule relative mt-1 mb-3 ml-[11px] border-l pl-[21px]"
    >
      {marker && (
        <span
          aria-hidden="true"
          className="bg-accent absolute -left-px w-[2px] transition-[top,height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          style={{ top: marker.top, height: marker.height }}
        />
      )}
      {sections.map((s) => {
        const on = s.id === active;
        return (
          <li key={s.id} data-id={s.id}>
            <a
              href={`#${s.id}`}
              onClick={onNavigate}
              aria-current={on ? "location" : undefined}
              className={cn(
                "grid grid-cols-[22px_minmax(0,1fr)] gap-x-1 py-[5px] text-[14px] leading-[1.35] transition-colors",
                on ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[12.5px]",
                  on ? "text-accent font-bold" : "text-ink-faint",
                )}
              >
                {s.n !== undefined ? `${s.n}.` : ""}
              </span>
              <span>{s.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function RailNav({
  course,
  parts,
  sections,
  active,
  opened,
  onNavigate,
}: {
  course: { title: string; href: string };
  parts: RailPart[];
  sections: Section[];
  active?: string;
  /** Chapters this reader has opened before, by slug. */
  opened: ReadonlySet<string>;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label={`${course.title} chapters`}>
      <Link
        href={course.href}
        onClick={onNavigate}
        className="text-ink hover:text-accent text-[16px] font-bold transition-colors"
      >
        {course.title}
      </Link>
      {parts.map((part) => (
        <div key={part.title} className="mt-6">
          <p className="dd-label">{part.title}</p>
          <ol className="mt-1.5">
            {part.chapters.map((ch) => (
              <li key={ch.num}>
                {ch.href ? (
                  <Link
                    href={ch.href}
                    onClick={onNavigate}
                    aria-current={ch.current ? "page" : undefined}
                    className={cn(
                      "group grid grid-cols-[42px_minmax(0,1fr)] gap-x-1 py-[5px] text-[14.5px] leading-[1.35] transition-colors",
                      ch.current
                        ? "text-accent font-bold"
                        : "text-ink-body hover:text-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[13px]",
                        ch.current ? "text-accent" : "text-ink-faint",
                      )}
                    >
                      {ch.num}.
                    </span>
                    <span>
                      {ch.title}
                      {!ch.current && opened.has(ch.slug) && (
                        <>
                          <IconCheck
                            size={10}
                            className="text-ink-faint ml-1.5 inline align-baseline"
                          />
                          <span className="sr-only"> (opened)</span>
                        </>
                      )}
                    </span>
                  </Link>
                ) : (
                  <span className="text-ink-faint grid grid-cols-[42px_minmax(0,1fr)] gap-x-1 py-[5px] text-[14.5px] leading-[1.35]">
                    <span className="font-mono text-[13px]">{ch.num}.</span>
                    <span>
                      {ch.title}
                      <span className="sr-only"> (not published yet)</span>
                    </span>
                  </span>
                )}
                {ch.current && (
                  <SectionList
                    sections={sections}
                    active={active}
                    onNavigate={onNavigate}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </nav>
  );
}

/**
 * The course down the left edge: parts, chapters as numbered moves, and the
 * current chapter's sections under it. Below 1024px it folds into a strip that
 * opens the same list as a full-height sheet.
 */
export function ChapterRail({
  course,
  parts,
  current,
}: {
  course: { slug: string; title: string; href: string };
  parts: RailPart[];
  current: { num: string; slug: string; title: string };
}) {
  const { sections, active } = useSections();
  const progress = useProgress();
  const seen = progress?.[course.slug]?.opened;
  const opened = new Set(Array.isArray(seen) ? seen : []);

  useEffect(() => {
    recordVisit(course.slug, current.slug);
  }, [course.slug, current.slug]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const activeSection = sections.find((s) => s.id === active);

  // Keep the current chapter in view in a long rail.
  useEffect(() => {
    railRef.current
      ?.querySelector<HTMLElement>("[aria-current=page]")
      ?.scrollIntoView({ block: "center" });
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <aside
        ref={railRef}
        className="no-scrollbar sticky top-0 hidden h-dvh overflow-y-auto pt-10 pb-16 lg:block"
      >
        <RailNav
          course={course}
          parts={parts}
          sections={sections}
          active={active}
          opened={opened}
        />
      </aside>

      <div className="border-rule bg-ground/95 sticky top-0 z-30 -mx-5 border-b px-5 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:hidden">
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="flex min-h-12 w-full items-center gap-3 text-left"
        >
          <IconMenu />
          <span className="min-w-0 truncate text-[15px]">
            <span className="text-ink font-mono text-[13px]">
              {current.num}.
            </span>{" "}
            <span className="text-ink font-semibold">{current.title}</span>
            {activeSection && (
              <span className="text-ink-muted"> · {activeSection.title}</span>
            )}
          </span>
          <span className="sr-only">Open the chapter list</span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${course.title} chapters`}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="bg-ground text-ink m-0 h-dvh max-h-none w-full max-w-none p-0 backdrop:bg-transparent lg:hidden"
      >
        <div className="border-rule bg-ground sticky top-0 flex min-h-12 items-center justify-between border-b px-5 sm:px-8">
          <span className="text-ink-muted text-[15px]">Chapters</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close the chapter list"
            className="text-ink-muted hover:text-ink -mr-2.5 inline-flex size-11 items-center justify-center"
          >
            <IconX size={14} />
          </button>
        </div>
        <div className="px-5 pt-6 pb-16 sm:px-8">
          <RailNav
            course={course}
            parts={parts}
            sections={sections}
            active={active}
            opened={opened}
            onNavigate={close}
          />
        </div>
      </dialog>
    </>
  );
}
