import type { Metadata } from "next";
import Link from "next/link";
import { courseHref, courses } from "@/lib/content/learn";
import { allLabs, labHref } from "@/lib/content/registry";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Two courses and a lab, in order: how networks work, how Google Cloud does it, then a platform built wrong to fix.",
};

/** The learning path: the two courses, then the labs, as three moves. */
export default function LearnPage() {
  const labs = allLabs();
  const moves = [
    ...courses.map((c) => ({
      href: courseHref(c),
      title: c.title,
      body: c.summary,
      meta: `${c.chapters.filter((ch) => ch.num !== "0").length} chapters`,
    })),
    ...labs.slice(0, 1).map((ctx) => ({
      href: labHref(ctx),
      title: `Fix a broken platform: ${ctx.lab.title}`,
      body: ctx.lab.summary,
      meta: ctx.lab.disclaimer ?? "",
    })),
  ];

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
      <header className="max-w-[760px]">
        <h1 className="dd-head animate-rise text-ink text-[38px] sm:text-[48px]">
          Learn how networks work. Then fix one that doesn’t.
        </h1>
        <p className="text-ink-body mt-4 max-w-[56ch] text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
          Two courses and a lab, meant to be taken in order. Every chapter
          follows the same small company, Kadé, so each idea lands on addresses
          you have already seen.
        </p>
      </header>
      <ol className="mt-14 max-w-[860px]">
        {moves.map((m, i) => (
          <li key={m.href} className="border-rule border-t">
            <Link
              href={m.href}
              className="group grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-x-2 py-6"
            >
              <span className="text-ink-faint group-hover:text-accent font-mono text-[17px] font-bold transition-colors">
                {i + 1}.
              </span>
              <span>
                <span className="text-accent decoration-accent/40 text-[24px] font-bold underline decoration-[1.5px] underline-offset-4 transition-colors group-hover:decoration-current">
                  {m.title}
                </span>
                <span className="text-ink-body mt-1.5 block max-w-[60ch] text-[17px] leading-[1.55] text-pretty">
                  {m.body}
                </span>
                {m.meta && (
                  <span className="text-ink-muted mt-1.5 block text-[14.5px]">
                    {m.meta}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
