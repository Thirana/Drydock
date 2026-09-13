"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SegmentedControl } from "@/components/ui/controls";
import { IconChevronDown } from "@/components/ui/icons";
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
import { CommandBlock } from "./command-block";
import { DEFECT_CHIP } from "./defect-link";
import { SeverityBadge } from "./severity-badge";

const EYEBROW =
  "text-gl-text-faint text-[10px] font-bold tracking-[0.12em] uppercase";

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-gl-danger",
  high: "bg-gl-danger/55",
  medium: "bg-gl-warning",
  low: "bg-gl-text-faint",
};

type PhaseFilter = "all" | `${number}`;
type SeverityFilter = "all" | Severity;

const matches = (d: Defect, phase: PhaseFilter, severity: SeverityFilter) =>
  (phase === "all" || phase === String(d.phase)) &&
  (severity === "all" || severity === d.severity);

export function DefectRegister({ model }: { model: ArchitectureModel }) {
  const sorted = useMemo(
    () => [...model.defects].sort(byPhaseThenSeverity),
    [model],
  );
  const byId = useMemo(() => defectIndex(model), [model]);
  const steps = model.phases.filter((p) => p.number > 0);
  const phaseName = (n: number) =>
    model.phases.find((p) => p.number === n)?.name;

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

  const stats = [
    { label: "Total", value: model.defects.length },
    ...SEVERITIES.map((s) => ({
      label: s,
      value: model.defects.filter((d) => d.severity === s).length,
      dot: SEVERITY_DOT[s],
    })),
    { label: "Phases", value: steps.length },
  ];

  return (
    <div className="not-prose space-y-5">
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-gl-border bg-gl-surface shadow-gl rounded-xl border p-5"
          >
            <p className={cn(EYEBROW, "flex items-center gap-1.5")}>
              {"dot" in stat && (
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", stat.dot)}
                />
              )}
              {stat.label}
            </p>
            <p className="text-gl-text mt-3 font-mono text-[28px] leading-none font-bold tracking-[-0.02em]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2">
        <div className="flex max-w-full items-center gap-2.5">
          <span className={EYEBROW}>Phase</span>
          <SegmentedControl<PhaseFilter>
            label="Filter by phase"
            value={phaseFilter}
            onChange={(v) => applyFilters(v, severityFilter)}
            options={[
              { value: "all", label: "All" },
              ...steps.map((p) => ({
                value: `${p.number}` as PhaseFilter,
                label: String(p.number),
              })),
            ]}
          />
        </div>
        <div className="flex max-w-full items-center gap-2.5">
          <span className={EYEBROW}>Severity</span>
          <SegmentedControl<SeverityFilter>
            label="Filter by severity"
            value={severityFilter}
            onChange={(v) => applyFilters(phaseFilter, v)}
            options={[
              { value: "all", label: "All" },
              ...SEVERITIES.map((s) => ({
                value: s,
                label: s[0].toUpperCase() + s.slice(1),
              })),
            ]}
          />
        </div>
        <span className="text-gl-text-faint ml-auto font-mono text-[11px]">
          {visible.length} of {model.defects.length}
        </span>
      </div>

      {visible.length === 0 && (
        <p className="text-gl-text-muted px-6 py-10 text-center text-[13px] leading-relaxed">
          No defects match these filters.
        </p>
      )}

      <div className="space-y-3">
        {visible.map((d) => {
          const blockers = d.blockedBy
            .map((id) => byId.get(id))
            .filter((x): x is Defect => !!x);
          const blocks = model.defects.filter((x) =>
            x.blockedBy.includes(d.id),
          );
          return (
            <details
              key={d.id}
              id={d.id}
              open={open.has(d.id)}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;
                setOpen((current) => {
                  if (current.has(d.id) === isOpen) return current;
                  const next = new Set(current);
                  if (isOpen) next.add(d.id);
                  else next.delete(d.id);
                  return next;
                });
              }}
              className="group border-gl-border bg-gl-surface shadow-gl open:shadow-gl-lg scroll-mt-32 overflow-hidden rounded-2xl border transition-shadow"
            >
              <summary className="hover:bg-gl-surface-2 flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 px-5 py-4 transition-colors duration-150 sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="bg-gl-danger-soft text-gl-danger rounded-full px-2.5 py-1 font-mono text-[11px] leading-none font-semibold">
                  {d.id}
                </span>
                <SeverityBadge severity={d.severity} />
                <span className="text-gl-text group-open:text-gl-primary min-w-0 flex-1 basis-[220px] text-[15px] font-semibold tracking-[-0.01em] transition-colors">
                  {d.title}
                </span>
                <span className="border-gl-border bg-gl-surface-2 text-gl-text-muted rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none">
                  phase {d.phase} · {phaseName(d.phase)}
                </span>
                <IconChevronDown
                  size={14}
                  className="text-gl-text-muted group-open:text-gl-primary transition-transform duration-300 group-open:rotate-180"
                />
              </summary>

              <div className="border-gl-border space-y-5 border-t px-5 py-5 sm:px-6">
                <div>
                  <p className="text-gl-text text-[15px] leading-[1.6] font-medium">
                    {d.symptom}
                  </p>
                  <p className="text-gl-text-muted mt-2 max-w-[80ch] text-[14px] leading-[1.7]">
                    {d.explanation}
                  </p>
                </div>

                <div className="border-gl-primary border-l-2 pl-4">
                  <p className={EYEBROW}>Concept</p>
                  <p className="text-gl-text-muted mt-1 max-w-[80ch] text-[14px] leading-[1.65]">
                    {d.concept}
                  </p>
                </div>

                {(blockers.length > 0 || blocks.length > 0) && (
                  <div className="flex flex-wrap gap-x-10 gap-y-4">
                    {blockers.length > 0 && (
                      <div>
                        <p className={EYEBROW}>Cannot start until</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {blockers.map(chip)}
                        </div>
                      </div>
                    )}
                    {blocks.length > 0 && (
                      <div>
                        <p className={EYEBROW}>Blocks</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {blocks.map(chip)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className={cn(EYEBROW, "mb-2")}>How you would find it</p>
                  <CommandBlock label="detect">{d.detection}</CommandBlock>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border-gl-border bg-gl-surface-2 rounded-xl border p-4">
                    <p className="text-gl-danger font-mono text-[10px] font-bold tracking-[0.12em] uppercase">
                      Now
                    </p>
                    <p className="text-gl-text mt-1.5 text-[13.5px] leading-[1.6]">
                      {d.before}
                    </p>
                  </div>
                  <div className="border-gl-border bg-gl-surface-2 rounded-xl border p-4">
                    <p className="text-gl-success font-mono text-[10px] font-bold tracking-[0.12em] uppercase">
                      Fixed
                    </p>
                    <p className="text-gl-text mt-1.5 text-[13.5px] leading-[1.6]">
                      {d.after}
                    </p>
                  </div>
                </div>

                <div>
                  <p className={cn(EYEBROW, "mb-2")}>
                    The change that closes it
                  </p>
                  <CommandBlock label="fix">{d.remediation}</CommandBlock>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
