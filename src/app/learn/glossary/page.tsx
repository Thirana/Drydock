import type { Metadata } from "next";
import Link from "next/link";
import { glossary, letterOf, type GlossaryEntry } from "@/lib/content/glossary";
import { headingId } from "@/lib/content/heading-id";
import { cn } from "@/lib/utils";

const LEAD =
  "Every term the two courses define, in the sentence that introduces it. Each one links to its section.";

export const metadata: Metadata = { title: "Glossary", description: LEAD };

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

/** The sentence, with the term set as it is in the chapter. */
function Sentence({ entry }: { entry: GlossaryEntry }) {
  const at = entry.sentence.indexOf(entry.term);
  if (at < 0) return <>{entry.sentence}</>;
  return (
    <>
      {entry.sentence.slice(0, at)}
      <span className="text-ink font-semibold">{entry.term}</span>
      {entry.sentence.slice(at + entry.term.length)}
    </>
  );
}

export default function GlossaryPage() {
  const entries = glossary();
  const groups = LETTERS.map((letter) => ({
    letter,
    entries: entries.filter((e) => letterOf(e.term) === letter),
  }));

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
      <header className="max-w-[760px]">
        <h1 className="dd-head animate-rise text-ink text-[38px] sm:text-[48px]">
          Glossary
        </h1>
        <p className="text-ink-body mt-4 max-w-[56ch] text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
          {LEAD}
        </p>
        <p className="text-ink-muted mt-4 text-[15px]">
          {entries.length} terms, A to Z.
        </p>
      </header>

      <nav
        aria-label="Letters"
        className="border-rule bg-ground/95 z-20 mt-10 border-b backdrop-blur-sm sm:sticky sm:top-0"
      >
        <ol className="flex flex-wrap gap-x-1">
          {groups.map(({ letter, entries: inGroup }) => (
            <li key={letter} className="shrink-0">
              {inGroup.length ? (
                <a
                  href={`#letter-${letter === "#" ? "0" : letter}`}
                  className="text-ink-muted hover:text-accent inline-flex min-h-12 min-w-8 items-center justify-center font-mono text-[15px] font-bold transition-colors"
                >
                  {letter}
                </a>
              ) : (
                <span
                  aria-hidden="true"
                  className="text-rule-strong inline-flex min-h-12 min-w-8 items-center justify-center font-mono text-[15px]"
                >
                  {letter}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 max-w-[1000px] space-y-14">
        {groups
          .filter((g) => g.entries.length)
          .map(({ letter, entries: inGroup }) => (
            <section
              key={letter}
              id={`letter-${letter === "#" ? "0" : letter}`}
              aria-labelledby={`letter-${letter === "#" ? "0" : letter}-title`}
              className="scroll-mt-20"
            >
              <h2
                id={`letter-${letter === "#" ? "0" : letter}-title`}
                className="border-ink text-ink border-b pb-2.5 font-mono text-[22px] font-bold"
              >
                {letter === "#" ? (
                  <>
                    #<span className="sr-only"> Numbers and symbols</span>
                  </>
                ) : (
                  letter
                )}
              </h2>
              <dl>
                {inGroup.map((entry) => (
                  <div
                    key={entry.term}
                    id={`term-${headingId(entry.term)}`}
                    className={cn(
                      "border-rule grid scroll-mt-20 gap-x-10 gap-y-1.5 border-b py-5",
                      "md:grid-cols-[220px_minmax(0,1fr)]",
                    )}
                  >
                    <dt>
                      <dfn className="text-ink text-[18px] leading-[1.35] font-bold not-italic">
                        {entry.term}
                      </dfn>
                    </dt>
                    <dd className="min-w-0">
                      <p className="text-ink-body max-w-[68ch] text-[16.5px] leading-[1.6] text-pretty">
                        <Sentence entry={entry} />
                      </p>
                      <p className="text-ink-muted mt-1.5 text-[14.5px]">
                        Introduced in{" "}
                        <Link href={entry.href} className="dd-link">
                          {entry.chapter}
                        </Link>{" "}
                        · {entry.where}
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
      </div>
    </main>
  );
}
