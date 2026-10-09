import type { Metadata } from "next";
import Link from "next/link";
import { CourseParts, LearningPath } from "@/components/learn/path";
import { glossaryHref } from "@/lib/content/learn";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Two courses and a lab, in order: how networks work, how Google Cloud does it, then a platform built wrong to fix.",
};

/** The learning path: the two courses, then the labs, as three moves; then what the courses cover. */
export default function LearnPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
      <header className="max-w-[760px]">
        <h1 className="dd-head animate-rise text-ink text-[38px] sm:text-[48px]">
          Two courses and a lab, in order.
        </h1>
        <p className="text-ink-body mt-4 max-w-[56ch] text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
          Every chapter follows the same small company, Kadé, so each idea lands
          on addresses you have already seen. Then the lab hands you a platform
          built wrong, to fix in the right order.
        </p>
      </header>
      <LearningPath className="mt-14" />
      <section aria-labelledby="parts-title" className="mt-20">
        <h2
          id="parts-title"
          className="dd-head text-ink mb-8 text-[28px] sm:text-[32px]"
        >
          What the courses cover
        </h2>
        <CourseParts />
        <p className="text-ink-muted mt-10 text-[16px]">
          Looking for one word? The{" "}
          <Link href={glossaryHref} className="dd-link">
            glossary
          </Link>{" "}
          lists every term the courses define, with the chapter that introduces
          it.
        </p>
      </section>
    </main>
  );
}
