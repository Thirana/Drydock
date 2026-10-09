import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { chapterText } from "@content/learn/chapters";
import { ChapterPage } from "@/components/learn/chapter-page";
import {
  getChapter,
  isPublished,
  publishedChapters,
} from "@/lib/content/learn";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedChapters().map(({ course, chapter }) => ({
    course: course.slug,
    chapter: chapter.slug,
  }));
}

async function resolve(
  params: PageProps<"/learn/[course]/[chapter]">["params"],
) {
  const { course, chapter } = await params;
  const ctx = getChapter(course, chapter);
  return ctx && isPublished(ctx.chapter) ? ctx : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[course]/[chapter]">): Promise<Metadata> {
  const ctx = await resolve(params);
  if (!ctx) return {};
  const title = `${ctx.chapter.title} · ${ctx.course.title}`;
  return {
    title,
    description: ctx.chapter.lead,
    openGraph: { title, description: ctx.chapter.lead, type: "article" },
  };
}

export default async function ChapterRoute({
  params,
}: PageProps<"/learn/[course]/[chapter]">) {
  const ctx = await resolve(params);
  const load = ctx && chapterText[ctx.course.slug]?.[ctx.chapter.slug];
  if (!ctx || !load) notFound();
  const { default: Content } = await load();
  return <ChapterPage ctx={ctx} Content={Content} />;
}
