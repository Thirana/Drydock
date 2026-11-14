import Link from "next/link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import type { Practice } from "@/lib/content/crosslinks";
import { harbour, harbourHref } from "@/lib/content/harbour";

/** The end of a chapter: the case study's defects that are this chapter's idea, left undone. */
export function SeeItBroken({ defects }: { defects: Practice[] }) {
  if (!defects.length) return null;

  return (
    <section
      aria-labelledby="see-it-broken"
      className="border-rule mt-16 max-w-[760px] border-t pt-9"
    >
      <h2
        id="see-it-broken"
        className="dd-head text-ink scroll-mt-28 text-[26px] sm:text-[30px] lg:scroll-mt-10"
      >
        See it broken
      </h2>
      <p className="text-ink-body mt-3 max-w-[62ch] text-[17px] leading-[1.6] text-pretty">
        <Link href={harbourHref} className="dd-link">
          {harbour.title}
        </Link>{" "}
        is a platform built wrong on purpose.{" "}
        {defects.length === 1
          ? "This defect is this chapter's idea, left undone: what it breaks, how you would find it, and the change that closes it."
          : "These defects are this chapter's ideas, left undone: what each one breaks, how you would find it, and the change that closes it."}
      </p>
      <ol className="border-rule mt-6 border-t">
        {defects.map((d) => (
          <li
            key={d.id}
            className="border-rule grid grid-cols-[56px_minmax(0,1fr)] items-baseline gap-x-3 border-b py-4"
          >
            <span className="text-fault font-mono text-[15px] font-bold">
              {d.id}
            </span>
            <div className="min-w-0">
              <Link
                href={d.href}
                className="text-accent decoration-accent/40 text-[18px] leading-[1.35] font-bold underline decoration-[1.5px] underline-offset-4 transition-colors hover:decoration-current"
              >
                {d.title}
              </Link>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <SeverityBadge severity={d.severity} />
                <span className="text-ink-muted text-[14px]">
                  closes in phase {d.phase}, {d.phaseName}
                </span>
              </p>
              {d.sections.length > 0 && (
                <p className="text-ink-muted mt-1.5 text-[14.5px] leading-[1.5]">
                  Goes with{" "}
                  {d.sections.map((s, i) => (
                    <span key={s.href}>
                      {i > 0 && " and "}
                      <a href={s.href} className="dd-link">
                        {s.title}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
