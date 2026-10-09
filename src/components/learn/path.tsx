import Link from "next/link";
import { courseHref, courses } from "@/lib/content/learn";
import { allLabs, labHref } from "@/lib/content/registry";
import { labStats } from "@/lib/content/stats";
import type { Course } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const numbered = (course: Course) =>
  course.chapters.filter((c) => c.num !== "0");

function readingTime(course: Course) {
  const minutes = course.chapters.reduce((sum, c) => sum + c.minutes, 0);
  const hours = Math.round(minutes / 30) / 2;
  return `${hours} hours of reading`;
}

interface Move {
  href: string;
  title: string;
  body: string;
  meta: string;
}

/** The whole guide in order: the two courses, then the first lab. */
export function pathMoves(): Move[] {
  const lab = allLabs()[0];
  const stats = lab && labStats(lab.lab);
  return [
    ...courses.map((c) => ({
      href: courseHref(c),
      title: c.title,
      body: c.summary,
      meta: `${numbered(c).length} chapters · ${readingTime(c)}`,
    })),
    ...(lab
      ? [
          {
            href: labHref(lab),
            title: `Fix a broken platform: ${lab.lab.title}`,
            body: lab.lab.summary,
            meta: stats
              ? `${stats.defects} defects · fixed in ${stats.phases} phases`
              : (lab.lab.disclaimer ?? ""),
          },
        ]
      : []),
  ];
}

/**
 * The learning path as numbered moves on one line - the score at the scale of
 * the whole site. A row of equal moves from 1024px, a ruled list below.
 */
export function LearningPath({ className }: { className?: string }) {
  const moves = pathMoves();
  return (
    <ol
      className={cn(
        "border-rule grid border-t lg:grid-cols-3 lg:gap-x-10",
        className,
      )}
    >
      {moves.map((m, i) => (
        <li
          key={m.href}
          className="border-rule border-b last:border-b-0 lg:border-b-0"
        >
          <Link
            href={m.href}
            className="group grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-x-2 py-6 lg:block lg:pt-5"
          >
            <span className="text-ink-faint group-hover:text-accent font-mono text-[17px] font-bold transition-colors lg:block">
              {i + 1}.
            </span>
            <span className="lg:mt-3 lg:block">
              <span className="text-accent decoration-accent/40 text-[21px] leading-[1.3] font-bold underline decoration-[1.5px] underline-offset-4 transition-colors group-hover:decoration-current">
                {m.title}
              </span>
              <span className="text-ink-body mt-2 block max-w-[46ch] text-[16.5px] leading-[1.55] text-pretty">
                {m.body}
              </span>
              {m.meta && (
                <span className="text-ink-muted mt-2 block text-[14.5px]">
                  {m.meta}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Both courses side by side: each part with its chapter count, linking to the part on the course page. */
export function CourseParts() {
  return (
    <div className="grid gap-x-12 gap-y-14 lg:grid-cols-2">
      {courses.map((course, ci) => (
        <section key={course.slug} aria-labelledby={`parts-${course.slug}`}>
          <h3
            id={`parts-${course.slug}`}
            className="border-ink flex items-baseline gap-3 border-b pb-3"
          >
            <span className="text-ink-faint font-mono text-[18px] font-bold">
              {ci + 1}.
            </span>
            <Link
              href={courseHref(course)}
              className="dd-head text-ink hover:text-accent text-[24px] transition-colors"
            >
              {course.title}
            </Link>
          </h3>
          <ol>
            {course.parts.map((part) => {
              const chapters = course.chapters.filter(
                (c) => c.part === part.id,
              );
              const first = chapters[0];
              const last = chapters.at(-1);
              return (
                <li key={part.id} className="border-rule border-b">
                  <Link
                    href={`${courseHref(course)}#part-${part.id}`}
                    className="group hover:bg-sunk grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 py-3.5 transition-colors"
                  >
                    <span className="text-ink group-hover:text-accent text-[17px] transition-colors">
                      {part.title}
                    </span>
                    <span className="text-ink-muted text-[14px]">
                      {first === last ? "chapter " : "chapters "}
                      <span className="font-mono text-[13.5px] tabular-nums">
                        {first === last
                          ? first?.num
                          : `${first?.num}-${last?.num}`}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
