import type { MDXContent } from "mdx/types";
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
import { SearchMeta } from "@/components/site/search-meta";
import { SeeItBroken } from "./see-it-broken";

/** One chapter: the course rail, the title and lead, the text, and the moves either side. */
export function ChapterPage({
  ctx,
  Content,
}: {
  ctx: ChapterContext;
  /** The chapter's MDX, loaded by the route. */
  Content: MDXContent;
}) {
  const { course, chapter } = ctx;

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
        slug: c.slug,
        title: c.title,
        href: isPublished(c) ? chapterHref({ course, chapter: c }) : undefined,
        current: c === chapter,
      })),
  }));

  const { prev, next } = neighbours(ctx);
  // After the last chapter, the path continues into the first lab.
  const lab = next ? undefined : allLabs()[0];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:grid lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-x-24">
      <ChapterRail
        course={{
          slug: course.slug,
          title: course.title,
          href: courseHref(course),
        }}
        parts={parts}
        current={{
          num: chapter.num,
          slug: chapter.slug,
          title: chapter.title,
        }}
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

        <article
          data-chapter
          data-pagefind-body
          className="gl-prose dd-chapter pt-6"
        >
          <SearchMeta
            title={chapter.title}
            where={[`${course.short} ${chapter.num}`, part?.title]
              .filter(Boolean)
              .join(" · ")}
          />
          <Content components={chapterMdxComponents(course)} />
        </article>

        <SeeItBroken labs={practiceFor(ctx)} />

        <nav
          aria-label="Chapters"
          className="border-rule mt-16 grid max-w-[760px] gap-8 border-t pt-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]"
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
              className="group flex flex-col gap-1.5"
            >
              {next.course !== course && (
                <span className="text-ink-muted text-[15px]">
                  Next course: {next.course.title}
                </span>
              )}
              <span className="dd-head text-accent inline-flex items-baseline gap-3 text-[24px]">
                <span className="text-ink-faint font-mono text-[18px]">
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
            <Link href={labHref(lab)} className="group flex flex-col gap-1.5">
              <span className="text-ink-muted text-[15px]">
                Next: fix a broken platform
              </span>
              <span className="dd-head text-accent inline-flex items-baseline gap-3 text-[24px]">
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
