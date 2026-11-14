"use client";

import { useProgress } from "@/lib/progress";

/** "opened", under a chapter's reading time, once this reader has opened it. */
export function OpenedMark({
  course,
  chapter,
}: {
  course: string;
  chapter: string;
}) {
  const progress = useProgress();
  if (!progress?.[course]?.opened?.includes(chapter)) return null;
  return (
    <span className="text-ink-muted inline-flex items-center gap-1.5 text-[13px] sm:mt-1">
      <span aria-hidden="true" className="bg-ink-muted size-1.5 rounded-full" />
      opened
    </span>
  );
}
