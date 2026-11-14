import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChapterList } from "@/components/learn/chapter-list";
import { ContinueReading } from "@/components/learn/continue-reading";
import { CourseHero } from "@/components/learn/course-hero";
import { CourseRoute, type RoutePart } from "@/components/learn/course-route";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import {
  chapterHref,
  courses,
  getCourse,
  glossaryHref,
  isPublished,
} from "@/lib/content/learn";

export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map((c) => ({ course: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[course]">): Promise<Metadata> {
  const course = getCourse((await params).course);
  return course ? { title: course.title, description: course.summary } : {};
}

export default async function CoursePage({
  params,
}: PageProps<"/learn/[course]">) {
  const course = getCourse((await params).course);
  if (!course) notFound();
  const first = course.chapters.find(isPublished);
  const numbered = course.chapters.filter((c) => c.num !== "0").length;
  const route: RoutePart[] = course.parts.map((part) => {
    const chapters = course.chapters.filter((c) => c.part === part.id);
    const first = chapters[0]?.num;
    const last = chapters[chapters.length - 1]?.num;
    const published = chapters.filter(isPublished);
    return {
      id: part.id,
      title: part.title,
      range: first === last ? `chapter ${first}` : `chapters ${first}-${last}`,
      chapters: published.map((c) => c.slug),
      minutes: published.reduce((sum, c) => sum + c.minutes, 0),
    };
  });

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
      <header className="grid items-center gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="dd-head animate-rise text-ink text-[38px] sm:text-[48px]">
            {course.title}
          </h1>
          <p className="text-ink-body mt-4 max-w-[56ch] text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
            {course.summary}
          </p>
          <p className="text-ink-muted mt-4 text-[15px]">
            {numbered} chapters in {course.parts.length - 1} parts, after the
            Kadé reference. Terms are collected in the{" "}
            <Link href={glossaryHref} className="dd-link">
              glossary
            </Link>
            .
          </p>
          {first && (
            <ButtonLink
              href={chapterHref({ course, chapter: first })}
              size="lg"
              className="mt-8"
              trailing={<IconArrow size={14} />}
            >
              Start with {first.num}. {first.title}
            </ButtonLink>
          )}
          <ContinueReading
            course={course.slug}
            chapters={course.chapters.filter(isPublished).map((c) => ({
              slug: c.slug,
              num: c.num,
              title: c.title,
              href: chapterHref({ course, chapter: c }),
            }))}
          />
        </div>
        <CourseHero
          course={course.slug}
          className="hidden min-w-0 md:block lg:col-span-7 lg:w-full lg:max-w-[600px] lg:justify-self-end"
        />
      </header>
      <div className="mt-16 grid gap-x-16 sm:mt-20 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="max-w-[860px] min-w-0">
          <ChapterList course={course} />
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-10">
            <CourseRoute course={course.slug} parts={route} />
          </div>
        </aside>
      </div>
    </main>
  );
}
