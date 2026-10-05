import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterList } from "@/components/learn/chapter-list";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import {
  chapterHref,
  courses,
  getCourse,
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

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
      <header className="max-w-[760px]">
        <h1 className="dd-head animate-rise text-ink text-[38px] sm:text-[48px]">
          {course.title}
        </h1>
        <p className="text-ink-body mt-4 max-w-[56ch] text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
          {course.summary}
        </p>
        <p className="text-ink-muted mt-4 text-[15px]">
          {numbered} chapters in {course.parts.length - 1} parts, after the Kadé
          reference.
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
      </header>
      <div className="mt-16 max-w-[860px]">
        <ChapterList course={course} />
      </div>
    </main>
  );
}
