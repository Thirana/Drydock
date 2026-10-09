import { courses } from "@content/learn";
import type { Chapter, Course } from "./types";

export { courses };

export interface ChapterContext {
  course: Course;
  chapter: Chapter;
}

for (const course of courses) {
  for (const key of ["slug", "num"] as const) {
    const seen = new Set<string>();
    for (const chapter of course.chapters) {
      if (seen.has(chapter[key]))
        throw new Error(
          `Duplicate chapter ${key} "${chapter[key]}" in ${course.slug}`,
        );
      seen.add(chapter[key]);
    }
  }
  for (const chapter of course.chapters)
    if (!course.parts.some((p) => p.id === chapter.part))
      throw new Error(
        `Chapter ${course.slug}/${chapter.slug}: no part "${chapter.part}"`,
      );
}

export const isPublished = (chapter: Chapter) => !chapter.draft;

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug);
}

export function getChapter(
  courseSlug: string,
  chapterSlug: string,
): ChapterContext | undefined {
  const course = getCourse(courseSlug);
  const chapter = course?.chapters.find((c) => c.slug === chapterSlug);
  return course && chapter ? { course, chapter } : undefined;
}

/** A chapter by its number, e.g. ("fundamentals", "3"). */
export function chapterByNum(
  courseSlug: string,
  num: string,
): ChapterContext | undefined {
  const course = getCourse(courseSlug);
  const chapter = course?.chapters.find((c) => c.num === num);
  return course && chapter ? { course, chapter } : undefined;
}

export const learnHref = "/learn";

export const glossaryHref = "/learn/glossary";

export function courseHref(course: Course) {
  return `/learn/${course.slug}`;
}

export function chapterHref({ course, chapter }: ChapterContext) {
  return `/learn/${course.slug}/${chapter.slug}`;
}

/** Every published chapter, courses in order, so the pager can cross from one course into the next. */
export function publishedChapters(): ChapterContext[] {
  return courses.flatMap((course) =>
    course.chapters.filter(isPublished).map((chapter) => ({ course, chapter })),
  );
}

export function neighbours(ctx: ChapterContext) {
  const all = publishedChapters();
  const i = all.findIndex(
    (c) => c.course === ctx.course && c.chapter === ctx.chapter,
  );
  return { prev: all[i - 1], next: all[i + 1] };
}

/** "4 of 34": position among the numbered chapters, chapter 0 being the reference. */
export function chapterPosition({ course, chapter }: ChapterContext) {
  const numbered = course.chapters.filter((c) => c.num !== "0");
  return { at: numbered.indexOf(chapter) + 1, of: numbered.length };
}
