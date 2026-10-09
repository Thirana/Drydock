import Link from "next/link";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/icons";
import { practiceFor } from "@/lib/content/crosslinks";
import {
  chapterHref,
  chapterPosition,
  courseHref,
  isPublished,
  neighbours,
  type ChapterContext,
} from "@/lib/content/learn";
import { allLabs, labHref } from "@/lib/content/registry";
import { ChapterRail, type RailPart } from "./chapter-rail";
import { chapterMdxComponents } from "./mdx";
import { SeeItBroken } from "./see-it-broken";

/** One chapter: the course rail, the title and lead, the text, and the moves either side. */
export function ChapterPage({ ctx }: { ctx: ChapterContext }) {
  const { course, chapter } = ctx;
  const { Content } = chapter;
  if (!Content) throw new Error(`Chapter ${chapter.slug} is not published`);

  const part = course.parts.find((p) => p.id === chapter.part);
  const { at, of } = chapterPosition(ctx);
  const isReference = chapter.num === "0";
  const meta = [
    part?.title,
    isReference ? "Reference, read this first" : `chapter ${at} of ${of}`,
    `${chapter.minutes} min read`,
  ].filter(Boolean);

  const parts: RailPart[] = course.parts.map((p) => ({
    title: p.title,
    chapters: course.chapters
      .filter((c) => c.part === p.id)
      .map((c) => ({
        num: c.num,
        title: c.title,
        href: isPublished(c) ? chapterHref({ course, chapter: c }) : undefined,
        current: c === chapter,
      })),
  }));

  const { prev, next } = neighbours(ctx);
  // After the last chapter, the path continues into the first lab.
  const lab = next ? undefined : allLabs()[0];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:grid lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-x-24">
      <ChapterRail
        course={{ title: course.title, href: courseHref(course) }}
        parts={parts}
        current={{ num: chapter.num, title: chapter.title }}
      />

      <main className="min-w-0 pt-10 pb-20 sm:pt-14">
        <header className="max-w-[760px]">
          <h1 className="dd-head animate-rise text-ink text-[38px] sm:text-[48px]">
            {chapter.title}
          </h1>
          <p className="text-ink-body mt-4 max-w-[62ch] text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
            {chapter.lead}
          </p>
          <p className="text-ink-muted mt-5 text-[15px]">{meta.join(" · ")}</p>
        </header>

        <article data-chapter className="gl-prose dd-chapter pt-6">
          <Content components={chapterMdxComponents(course)} />
        </article>

        <SeeItBroken labs={practiceFor(ctx)} />

        <nav
          aria-label="Chapters"
          className="border-rule mt-16 grid gap-8 border-t pt-8 sm:grid-cols-2"
        >
          <div>
            {prev && (
              <Link
                href={chapterHref(prev)}
                rel="prev"
                className="text-ink-muted hover:text-ink inline-flex items-baseline gap-2 text-[16px] transition-colors"
              >
                <IconArrowLeft size={12} className="self-center" />
                <span className="font-mono text-[14px]">
                  {prev.chapter.num}.
                </span>
                <span>
                  {prev.chapter.title}
                  {prev.course !== course && (
                    <span className="text-ink-faint">
                      {" "}
                      · {prev.course.short}
                    </span>
                  )}
                </span>
              </Link>
            )}
          </div>
          {next ? (
            <Link
              href={chapterHref(next)}
              rel="next"
              className="group flex flex-col gap-1.5 sm:items-end sm:text-right"
            >
              {next.course !== course && (
                <span className="text-ink-muted text-[15px]">
                  Next course: {next.course.title}
                </span>
              )}
              <span className="dd-head text-accent inline-flex items-baseline gap-3 text-[26px]">
                <span className="text-ink-faint font-mono text-[20px]">
                  {next.chapter.num}.
                </span>
                {next.chapter.title}
                <IconArrowRight
                  size={12}
                  className="size-4 self-center transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
              <span className="text-ink-body max-w-[48ch] text-[16px] leading-[1.55] text-pretty">
                {next.chapter.lead}
              </span>
            </Link>
          ) : lab ? (
            <Link
              href={labHref(lab)}
              className="group flex flex-col gap-1.5 sm:items-end sm:text-right"
            >
              <span className="text-ink-muted text-[15px]">
                Next: fix a broken platform
              </span>
              <span className="dd-head text-accent inline-flex items-baseline gap-3 text-[26px]">
                {lab.lab.title}
                <IconArrowRight
                  size={12}
                  className="size-4 self-center transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
              <span className="text-ink-body max-w-[48ch] text-[16px] leading-[1.55] text-pretty">
                {lab.lab.summary}
                {lab.lab.disclaimer && <> {lab.lab.disclaimer}</>}
              </span>
            </Link>
          ) : (
            <p className="text-ink-body text-[16px] sm:text-right">
              That is everything published so far.{" "}
              <Link href={courseHref(course)} className="dd-link">
                Back to {course.title}
              </Link>
            </p>
          )}
        </nav>
      </main>
    </div>
  );
}
