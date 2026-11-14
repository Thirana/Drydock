import Link from "next/link";
import type { ReactNode } from "react";
import { DefectLink } from "@/components/architecture/defect-link";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import { IconArrow, ICONS } from "@/components/ui/icons";
import type { Severity } from "@/lib/architecture/types";
import {
  defectsOn,
  getJourney,
  harbour,
  journeyHref,
  sections,
} from "@/lib/content/harbour";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

/**
 * The three parts as a reader's way in: what each holds, counted, so the
 * size of the case study shows before a word of it is read.
 */
export function Glance() {
  const model = harbour.architecture;
  const [, platform, journeys, defects] = sections;
  const count = (s: Severity) =>
    model.defects.filter((d) => d.severity === s).length;
  const cards: {
    section: (typeof sections)[number];
    frame: number;
    figure: number;
    unit: string;
    detail: ReactNode;
  }[] = [
    {
      section: platform,
      frame: 2,
      figure: harbour.platform.length,
      unit: "views of how it is built",
      detail: harbour.platform.map((p) => p.title).join(" · "),
    },
    {
      section: journeys,
      frame: 3,
      figure: model.journeys.length,
      unit: "flows traced hop by hop",
      detail: "Each one as found, then fixed. Watch where the packet stops.",
    },
    {
      section: defects,
      frame: 4,
      figure: model.defects.length,
      unit: "things wrong with it",
      detail: (
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          {SEVERITIES.map((s) => (
            <span key={s} className="inline-flex items-baseline gap-1">
              <span className="text-ink font-mono text-[14px] font-bold">
                {count(s)}
              </span>
              <SeverityBadge severity={s} />
            </span>
          ))}
        </span>
      ),
    },
  ];
  return (
    <ol className="not-prose my-8 grid gap-x-8 gap-y-2 md:grid-cols-3">
      {cards.map(({ section, frame, figure, unit, detail }) => {
        const Icon = ICONS[section.icon];
        return (
          <li key={section.href}>
            <Link
              href={section.href}
              className="group border-ink hover:border-accent flex h-full flex-col border-t-2 pt-3 pb-6 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="text-ink-faint group-hover:text-accent font-mono text-[14px] font-bold transition-colors">
                  {frame}.
                </span>
                <Icon
                  size={15}
                  className="text-ink-muted group-hover:text-accent transition-colors"
                />
                <span className="text-ink group-hover:text-accent text-[17px] font-bold transition-colors">
                  {section.label}
                </span>
                <IconArrow
                  size={13}
                  className="text-accent ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                />
              </span>
              <span className="mt-4 flex items-baseline gap-3">
                <span className="dd-head text-ink text-[52px] leading-none">
                  {figure}
                </span>
                <span className="text-ink-body text-[16px] leading-[1.35]">
                  {unit}
                </span>
              </span>
              <span className="text-ink-muted mt-3 block text-[15px] leading-[1.5] text-pretty">
                {detail}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** What keeps the business alive, each one a journey you can follow. */
export function Paths({ children }: { children: ReactNode }) {
  return (
    <ul className="not-prose my-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
      {children}
    </ul>
  );
}

export function Path({
  journey: slug,
  title,
  children,
}: {
  /** The journey that traces this path. */
  journey: string;
  title: string;
  children: ReactNode;
}) {
  const journey = getJourney(slug);
  if (!journey) throw new Error(`Unknown journey: ${slug}`);
  return (
    <li className="border-rule flex flex-col border-t pt-4 pb-7">
      <h3 className="text-ink text-[18px] font-bold">{title}</h3>
      <div className="text-ink-body mt-1.5 text-[16px] leading-[1.6] text-pretty">
        {children}
      </div>
      <p className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-3">
        <span className="text-ink-muted text-[14px]">Runs into</span>
        {defectsOn(journey).map((d) => (
          <DefectLink key={d.id} id={d.id} />
        ))}
        <Link
          href={journeyHref(slug)}
          className="text-accent decoration-accent/40 ml-auto inline-flex items-center gap-1.5 text-[15px] font-semibold underline decoration-[1.5px] underline-offset-4 hover:decoration-current"
        >
          Follow it <IconArrow size={12} />
        </Link>
      </p>
    </li>
  );
}
