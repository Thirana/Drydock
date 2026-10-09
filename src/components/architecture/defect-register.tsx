"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { SegmentedControl } from "@/components/ui/controls";
import { IconCheck, IconChevronDown } from "@/components/ui/icons";
import {
  byPhaseThenSeverity,
  defectIndex,
  SEVERITIES,
} from "@/lib/architecture/state";
import type {
  ArchitectureModel,
  Defect,
  Severity,
} from "@/lib/architecture/types";
import { cn } from "@/lib/utils";
import { keyFlags } from "@/lib/architecture/key-flags";
import type { Lesson } from "@/lib/content/crosslinks";
import { CommandBlock } from "./command-block";
import { DEFECT_CHIP } from "./defect-link";
import { SeverityBadge } from "./severity-badge";

const LABEL = "dd-label text-ink-muted";

type PhaseFilter = "all" | `${number}`;
type SeverityFilter = "all" | Severity;

const matches = (d: Defect, phase: PhaseFilter, severity: SeverityFilter) =>
  (phase === "all" || phase === String(d.phase)) &&
  (severity === "all" || severity === d.severity);

export function DefectRegister({
  model,
  lessons = {},
}: {
  model: ArchitectureModel;
  /** Course sections that teach each defect, by defect ID. */
  lessons?: Record<string, Lesson[]>;
}) {
  const sorted = useMemo(
    () => [...model.defects].sort(byPhaseThenSeverity),
    [model],
  );
  const byId = useMemo(() => defectIndex(model), [model]);
  const steps = model.phases.filter((p) => p.number > 0);

  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [open, setOpen] = useState(
    () => new Set(sorted.slice(0, 1).map((d) => d.id)),
  );
  const visible = sorted.filter((d) => matches(d, phaseFilter, severityFilter));

  const applyFilters = (phase: PhaseFilter, severity: SeverityFilter) => {
    setPhaseFilter(phase);
    setSeverityFilter(severity);
    const first = sorted.find((d) => matches(d, phase, severity));
    setOpen(new Set(first ? [first.id] : []));
  };

  /** Open a card, clearing any filter that hides it, and scroll it into view. */
  const reveal = useCallback(
    (id: string) => {
      const defect = byId.get(id);
      if (!defect) return;
      setPhaseFilter((f) =>
        f === "all" || f === String(defect.phase) ? f : "all",
      );
      setSeverityFilter((f) =>
        f === "all" || f === defect.severity ? f : "all",
      );
      setOpen((current) => new Set(current).add(id));
      requestAnimationFrame(() =>
        document
          .getElementById(id)
          ?.scrollIntoView({ block: "center", behavior: "smooth" }),
      );
    },
    [byId],
  );

  // Deep links: /defects#D5 from other views, and chips within this page.
  useEffect(() => {
    const onHash = () =>
      reveal(decodeURIComponent(window.location.hash.slice(1)));
    const frame = requestAnimationFrame(onHash);
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHash);
    };
  }, [reveal]);

  const chip = (d: Defect) => (
    <a
      key={d.id}
      className={DEFECT_CHIP}
      href={`#${d.id}`}
      onClick={() => reveal(d.id)}
    >
      {d.id} · phase {d.phase}
    </a>
  );

  const count = (severity: Severity) =>
    model.defects.filter((d) => d.severity === severity).length;
  const groups = steps
    .map((p) => ({
      phase: p,
      defects: visible.filter((d) => d.phase === p.number),
    }))
    .filter((g) => g.defects.length > 0);

  return (
    <div className="not-prose">
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4 pb-2">
        <div>
          <p className={cn(LABEL, "mb-2")}>Phase</p>
          <SegmentedControl<PhaseFilter>
            label="Filter by phase"
            value={phaseFilter}
            onChange={(v) => applyFilters(v, severityFilter)}
            options={[
              { value: "all", label: "All" },
              ...steps.map((p) => ({
                value: `${p.number}` as PhaseFilter,
                label: `${p.number}.`,
              })),
            ]}
          />
        </div>
        <div className="max-w-full">
          <p className={cn(LABEL, "mb-2")}>Severity</p>
          <SegmentedControl<SeverityFilter>
            label="Filter by severity"
            value={severityFilter}
            onChange={(v) => applyFilters(phaseFilter, v)}
            options={[
              { value: "all", label: "All" },
              ...SEVERITIES.map((s) => ({
                value: s,
                label: `${s} ${count(s)}`,
              })),
            ]}
          />
        </div>
        <p
          aria-live="polite"
          className="text-ink-muted ml-auto pb-2.5 text-[15px]"
        >
          {visible.length} of {model.defects.length} shown
        </p>
      </div>

      {visible.length === 0 && (
        <div className="border-rule mt-6 border-t py-12">
          <p className="dd-head text-ink text-[22px]">No defects match</p>
          <p className="text-ink-body mt-2 text-[16px]">
            No defect matches both filters. Set either one back to All.
          </p>
        </div>
      )}

      <div className="mt-10 space-y-14">
        {groups.map(({ phase: p, defects }) => (
          <section
            key={p.number}
            aria-labelledby={`register-phase-${p.number}`}
          >
            <h3
              id={`register-phase-${p.number}`}
              className="border-ink flex items-baseline gap-3 border-b pb-2.5"
            >
              <span className="text-ink-faint font-mono text-[20px] font-bold">
                {p.number}.
              </span>
              <span className="dd-head text-ink text-[22px]">{p.name}</span>
              <span className="text-ink-muted ml-auto text-[15px]">
                closes {defects.length}
              </span>
            </h3>
            <div>
              {defects.map((d) => (
                <Entry
                  key={d.id}
                  defect={d}
                  model={model}
                  byId={byId}
                  lessons={lessons[d.id] ?? []}
                  open={open.has(d.id)}
                  onToggle={(isOpen) =>
                    setOpen((current) => {
                      if (current.has(d.id) === isOpen) return current;
                      const next = new Set(current);
                      if (isOpen) next.add(d.id);
                      else next.delete(d.id);
                      return next;
                    })
                  }
                  chip={chip}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Entry({
  defect: d,
  model,
  byId,
  lessons,
  open,
  onToggle,
  chip,
}: {
  defect: Defect;
  model: ArchitectureModel;
  byId: Map<string, Defect>;
  lessons: Lesson[];
  open: boolean;
  onToggle: (open: boolean) => void;
  chip: (d: Defect) => ReactNode;
}) {
  const blockers = d.blockedBy
    .map((id) => byId.get(id))
    .filter((x): x is Defect => !!x);
  const blocks = model.defects.filter((x) => x.blockedBy.includes(d.id));

  return (
    <details
      id={d.id}
      open={open}
      onToggle={(event) => onToggle(event.currentTarget.open)}
      className="group border-rule scroll-mt-40 border-b"
    >
      <summary className="hover:bg-sunk grid cursor-pointer list-none grid-cols-[56px_minmax(0,1fr)_20px] items-baseline gap-x-3 py-4 transition-colors duration-150 [&::-webkit-details-marker]:hidden">
        <span className="text-fault font-mono text-[16px] font-bold">
          {d.id}
        </span>
        <span className="min-w-0">
          <span className="text-ink block text-[18px] leading-[1.35] font-semibold">
            {d.title}
          </span>
          <span className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <SeverityBadge severity={d.severity} />
            {blockers.length > 0 && (
              <span className="text-ink-muted text-[14px]">
                waits on{" "}
                <span className="text-ink font-mono font-semibold">
                  {d.blockedBy.join(", ")}
                </span>
              </span>
            )}
          </span>
        </span>
        <IconChevronDown
          size={14}
          className="text-ink-muted group-open:text-accent size-4 self-center transition-transform duration-300 group-open:rotate-180"
        />
      </summary>

      <div className="grid gap-x-12 gap-y-8 pt-2 pb-10 lg:grid-cols-12 lg:pl-[68px]">
        <div className="space-y-6 lg:col-span-5">
          <div>
            <p className="text-ink text-[18px] leading-[1.5] font-medium">
              <span className="dd-mark">{d.symptom}</span>
            </p>
            <p className="text-ink-body mt-3 text-[16px] leading-[1.62]">
              {d.explanation}
            </p>
          </div>

          <div className="border-rule grid gap-x-5 gap-y-1 border-t pt-4 sm:grid-cols-[80px_minmax(0,1fr)]">
            <p className="dd-label text-ink">Concept</p>
            <p className="text-ink-body text-[16px] leading-[1.6]">
              {d.concept}
            </p>
          </div>

          {lessons.length > 0 && (
            <div className="border-rule grid gap-x-5 gap-y-1 border-t pt-4 sm:grid-cols-[80px_minmax(0,1fr)]">
              <p className="dd-label text-ink">Learn it</p>
              <ul className="space-y-1.5 text-[16px] leading-[1.5]">
                {lessons.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="dd-link">
                      {l.section ?? l.chapter}
                    </Link>
                    <span className="text-ink-muted"> · {l.where}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(blockers.length > 0 || blocks.length > 0) && (
            <div className="border-rule grid gap-x-10 gap-y-4 border-t pt-4 sm:grid-cols-2">
              {blockers.length > 0 && (
                <div>
                  <p className={LABEL}>Cannot start until</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {blockers.map(chip)}
                  </div>
                </div>
              )}
              {blocks.length > 0 && (
                <div>
                  <p className={LABEL}>Blocks</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {blocks.map(chip)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-7">
          <div>
            <p className={cn(LABEL, "mb-2")}>How you would find it</p>
            <CommandBlock label="detect">{d.detection}</CommandBlock>
          </div>

          <dl className="border-rule grid border-y sm:grid-cols-2">
            <div className="border-rule py-4 sm:border-r sm:pr-5">
              <dt className="dd-label text-fault">Now</dt>
              <dd className="text-ink mt-1.5 text-[15.5px] leading-[1.55]">
                {d.before}
              </dd>
            </div>
            <div className="border-rule border-t py-4 sm:border-t-0 sm:pl-5">
              <dt className="dd-label text-ink inline-flex items-center gap-1.5">
                <IconCheck size={11} /> Fixed
              </dt>
              <dd className="text-ink mt-1.5 text-[15.5px] leading-[1.55]">
                {d.after}
              </dd>
            </div>
          </dl>

          <div>
            <p className={cn(LABEL, "mb-2")}>The change that closes it</p>
            <CommandBlock
              label="fix"
              marks={keyFlags(d.remediation, d.after, d.before)}
            >
              {d.remediation}
            </CommandBlock>
          </div>
        </div>
      </div>
    </details>
  );
}
