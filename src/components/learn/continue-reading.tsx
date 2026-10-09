"use client";

import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";
import { useProgress } from "@/lib/progress";

/** "Continue: 12. How routing works" - the last chapter this reader opened in the course, if any. */
export function ContinueReading({
  course,
  chapters,
}: {
  course: string;
  chapters: { slug: string; num: string; title: string; href: string }[];
}) {
  const progress = useProgress();
  const last = progress?.[course]?.last;
  const chapter = last && chapters.find((c) => c.slug === last);
  if (!chapter) return null;

  return (
    <p className="text-ink-muted mt-5 text-[16px]">
      Continue:{" "}
      <Link href={chapter.href} className="dd-link">
        <span className="font-mono text-[14px]">{chapter.num}.</span>{" "}
        {chapter.title}
      </Link>
      <IconArrowRight size={11} className="text-accent ml-1.5 inline" />
    </p>
  );
}
