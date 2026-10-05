import { courseHref, courses } from "./learn";

/** The site's main links: the two courses, then the labs. */
export function mainLinks() {
  return [
    ...courses.map((c) => ({ href: courseHref(c), label: c.short })),
    { href: "/#labs", label: "Labs" },
  ];
}
