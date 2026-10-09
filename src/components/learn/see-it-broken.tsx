import Link from "next/link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import type { LabPractice } from "@/lib/content/crosslinks";

/** The end of a chapter: the lab defects that are this chapter's idea, left undone. */
export function SeeItBroken({ labs }: { labs: LabPractice[] }) {
  if (!labs.length) return null;
  const total = labs.reduce((n, l) => n + l.defects.length, 0);

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
      {labs.map((lab) => (
        <div key={lab.labHref}>
          <p className="text-ink-body mt-3 max-w-[62ch] text-[17px] leading-[1.6] text-pretty">
            <Link href={lab.labHref} className="dd-link">
              {lab.lab}
            </Link>{" "}
            is a platform built wrong on purpose.{" "}
            {total === 1
              ? "This defect is this chapter's idea, left undone. Find it with a real command, then close it in its phase."
              : "These defects are this chapter's ideas, left undone. Find each one with a real command, then close them in order."}
          </p>
          <ol className="border-rule mt-6 border-t">
            {lab.defects.map((d) => (
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
        </div>
      ))}
    </section>
  );
}
