import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

/** Showcase panel: hard-shadow frame with a chrome bar. One per page. */
export function DiagramFrame({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <figure className="border-gl-border-strong bg-gl-surface shadow-gl-hard overflow-hidden rounded-2xl border">
      <figcaption className="border-gl-border bg-gl-bg-subtle flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b px-5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo size={16} />
          <span className="text-gl-text text-[13px] font-bold">{title}</span>
          {meta && (
            <span className="text-gl-text-faint truncate font-mono text-[11px]">
              · {meta}
            </span>
          )}
        </div>
        <DiagramLegend />
      </figcaption>
      <div className="bg-gl-bg overflow-x-auto">{children}</div>
      <p className="border-gl-border text-gl-text-muted border-t px-5 py-2.5 text-[12px] lg:hidden">
        This diagram is wide by design - scroll it sideways, or open it on a
        larger screen.
      </p>
    </figure>
  );
}

function LineSample({
  dashed,
  dim,
  danger,
}: {
  dashed?: boolean;
  dim?: boolean;
  danger?: boolean;
}) {
  return (
    <svg width="20" height="6" aria-hidden="true" className="shrink-0">
      <line
        x1="0"
        y1="3"
        x2="20"
        y2="3"
        strokeWidth="1.6"
        strokeDasharray={dashed ? "4 3" : undefined}
        opacity={dim ? 0.45 : 1}
        style={{
          stroke: danger ? "var(--tone-danger)" : "var(--gl-text-muted)",
        }}
      />
    </svg>
  );
}

export function DiagramLegend() {
  return (
    <ul className="text-gl-text-muted flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px]">
      <li className="inline-flex items-center gap-2">
        <LineSample /> traffic path
      </li>
      <li className="inline-flex items-center gap-2">
        <LineSample dashed dim /> not built yet
      </li>
      <li className="inline-flex items-center gap-2">
        <LineSample dashed danger /> defective path
      </li>
    </ul>
  );
}
