import Link from "next/link";
import { chapterHref, isPublished } from "@/lib/content/learn";
import type { Course } from "@/lib/content/types";
import { OpenedMark } from "./opened-mark";

/** A course's chapters grouped by part, each a numbered move with its lead. */
export function ChapterList({ course }: { course: Course }) {
  return (
    <div className="space-y-14">
      {course.parts.map((part) => {
        const chapters = course.chapters.filter((c) => c.part === part.id);
        return (
          <section
            key={part.id}
            id={`part-${part.id}`}
            aria-labelledby={`part-${part.id}-title`}
            className="scroll-mt-8"
          >
            <h2
              id={`part-${part.id}-title`}
              className="text-ink border-ink border-b pb-3 text-[22px] leading-[1.25] font-bold"
            >
              {part.title}
            </h2>
            <ol>
              {chapters.map((chapter) => {
                const published = isPublished(chapter);
                const body = (
                  <>
                    <span
                      className={
                        published
                          ? "text-ink-faint group-hover:text-accent font-mono text-[15px] font-bold transition-colors"
                          : "text-ink-faint font-mono text-[15px]"
                      }
                    >
                      {chapter.num}.
                    </span>
                    <span className="min-w-0">
                      <span
                        className={
                          published
                            ? "text-accent decoration-accent/40 text-[19px] font-bold underline decoration-[1.5px] underline-offset-4 transition-colors group-hover:decoration-current"
                            : "text-ink-muted text-[19px] font-bold"
                        }
                      >
                        {chapter.title}
                      </span>
                      <span
                        className={
                          published
                            ? "text-ink-body mt-1 block max-w-[64ch] text-[16px] leading-[1.55] text-pretty"
                            : "text-ink-faint mt-1 block max-w-[64ch] text-[16px] leading-[1.55] text-pretty"
                        }
                      >
                        {chapter.gist}
                      </span>
                      {!published && (
                        <span className="text-ink-muted mt-1.5 block text-[14px]">
                          Not published yet
                        </span>
                      )}
                    </span>
                    <span className="col-start-2 mt-1.5 flex items-center gap-x-3 sm:col-start-3 sm:mt-0 sm:block sm:text-right">
                      {published && (
                        <>
                          <span className="text-ink-muted font-mono text-[13.5px] whitespace-nowrap sm:block">
                            {chapter.minutes} min
                          </span>
                          <OpenedMark
                            course={course.slug}
                            chapter={chapter.slug}
                          />
                        </>
                      )}
                    </span>
                  </>
                );
                return (
                  <li key={chapter.num} className="border-rule border-b">
                    {published ? (
                      <Link
                        href={chapterHref({ course, chapter })}
                        className="group grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-x-2 py-5 sm:grid-cols-[48px_minmax(0,1fr)_64px]"
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-x-2 py-5 sm:grid-cols-[48px_minmax(0,1fr)_64px]">
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
