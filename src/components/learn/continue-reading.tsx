"use client";

import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";
import { useProgress } from "@/lib/progress";

/** "Pick up where you left off": the last chapter this reader opened in the course, if any. */
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
    <Link
      href={chapter.href}
      className="group border-accent animate-fade-in mt-7 flex max-w-[440px] items-center gap-4 border-l-[3px] py-1 pl-4"
    >
      <span className="min-w-0">
        <span className="text-ink-muted block text-[14px] font-semibold">
          Pick up where you left off
        </span>
        <span className="text-ink group-hover:text-accent mt-0.5 block text-[17px] leading-[1.35] font-bold transition-colors">
          <span className="text-accent font-mono text-[15px]">
            {chapter.num}.
          </span>{" "}
          {chapter.title}
          <IconArrowRight
            size={13}
            className="text-accent ml-2 inline align-[-1px] transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </Link>
  );
}
