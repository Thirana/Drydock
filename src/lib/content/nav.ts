import { chapterHref, courseHref, courses, isPublished } from "./learn";
import { labsHref, providerHref, providers } from "./registry";

export interface NavLink {
  href: string;
  label: string;
  /** Path prefixes that count as being in this section; defaults to `href`. */
  match?: string[];
}

/** The site's main links: the two courses, then the labs. */
export function mainLinks(): NavLink[] {
  return [
    ...courses.map((c) => ({ href: courseHref(c), label: c.short })),
    {
      href: labsHref,
      label: "Labs",
      match: [labsHref, ...providers.map(providerHref)],
    },
  ];
}

/** The header's call to action: chapter 1 of the first course. */
export function startLearning(): NavLink | undefined {
  const course = courses[0];
  const chapter = course?.chapters.find((c) => c.num !== "0" && isPublished(c));
  return course && chapter
    ? { href: chapterHref({ course, chapter }), label: "Start learning" }
    : undefined;
}
