import type { ChapterRef, Defect, Severity } from "@/lib/architecture/types";
import { headingId } from "./heading-id";
import {
  chapterHref,
  getChapter,
  isPublished,
  type ChapterContext,
} from "./learn";
import { allTracks, labHref, viewHref } from "./registry";

/**
 * Labs and courses link to each other through one list, written once: each
 * defect's `learn` refs. Defects link out to the sections that teach them, and
 * a chapter finds the defects that point at it.
 */

/** A course section a defect links to. Plain data, so client components can take it. */
export interface Lesson {
  href: string;
  /** Course and chapter number, e.g. "GCP 5.1". */
  where: string;
  chapter: string;
  section?: string;
}

function resolve(ref: ChapterRef): Lesson {
  const ctx = getChapter(ref.course, ref.chapter);
  if (!ctx || !isPublished(ctx.chapter))
    throw new Error(`No published chapter ${ref.course}/${ref.chapter}`);
  return {
    href: ref.section
      ? `${chapterHref(ctx)}#${headingId(ref.section)}`
      : chapterHref(ctx),
    where: `${ctx.course.short} ${ctx.chapter.num}`,
    chapter: ctx.chapter.title,
    section: ref.section,
  };
}

/** Every defect's lessons, by defect ID. */
export function lessonsByDefect(defects: Defect[]): Record<string, Lesson[]> {
  return Object.fromEntries(
    defects.map((d) => [d.id, (d.learn ?? []).map(resolve)]),
  );
}

/** A lab defect that puts a chapter into practice. */
export interface Practice {
  id: string;
  title: string;
  severity: Severity;
  phase: number;
  phaseName: string;
  /** The defect's entry in its lab's register. */
  href: string;
  /** Sections of this chapter the defect ties to, with their anchors. */
  sections: { title: string; href: string }[];
}

export interface LabPractice {
  lab: string;
  labHref: string;
  defects: Practice[];
}

/** The lab defects that point at a chapter, grouped by lab, in fix order. */
export function practiceFor(ctx: ChapterContext): LabPractice[] {
  const here = chapterHref(ctx);
  return allTracks().flatMap((track) => {
    const model = track.track.architecture;
    if (!model || !track.track.views.some((v) => v.slug === "defects"))
      return [];
    const register = viewHref(track, "defects");
    const defects = model.defects
      .map((d): Practice | undefined => {
        const refs = (d.learn ?? []).filter(
          (r) => r.course === ctx.course.slug && r.chapter === ctx.chapter.slug,
        );
        if (!refs.length) return undefined;
        return {
          id: d.id,
          title: d.title,
          severity: d.severity,
          phase: d.phase,
          phaseName: model.phases.find((p) => p.number === d.phase)?.name ?? "",
          href: `${register}#${d.id}`,
          sections: refs.flatMap((r) =>
            r.section
              ? [{ title: r.section, href: `${here}#${headingId(r.section)}` }]
              : [],
          ),
        };
      })
      .filter((p): p is Practice => !!p)
      .sort((a, b) => a.phase - b.phase);
    return defects.length
      ? [{ lab: track.lab.title, labHref: labHref(track), defects }]
      : [];
  });
}

// Fail the build on a ref to a chapter that does not exist or is unpublished.
for (const track of allTracks())
  for (const d of track.track.architecture?.defects ?? [])
    for (const ref of d.learn ?? []) resolve(ref);
