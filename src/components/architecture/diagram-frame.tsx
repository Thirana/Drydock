import type { ReactNode } from "react";

/** A figure: its caption above, the drawing below, nothing around it but a hairline. */
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
    <figure data-pagefind-ignore>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-3">
          <span className="text-ink text-[16px] font-bold">{title}</span>
          {meta && <span className="text-ink-muted text-[15px]">{meta}</span>}
        </span>
        <DiagramLegend />
      </figcaption>
      <div className="border-rule bg-ground overflow-x-auto rounded-[2px] border lg:mx-[calc(50%-min(50vw,720px)+24px)]">
        {children}
      </div>
      <p className="text-ink-muted mt-2 text-[14px] lg:hidden">
        Wide by design - scroll it sideways, or open it on a larger screen.
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
    <svg width="22" height="6" aria-hidden="true" className="shrink-0">
      <line
        x1="0"
        y1="3"
        x2="22"
        y2="3"
        strokeWidth="1.6"
        strokeDasharray={dashed ? "4 3" : undefined}
        opacity={dim ? 0.5 : 1}
        style={{
          stroke: danger ? "var(--tone-danger)" : "var(--dd-ink-muted)",
        }}
      />
    </svg>
  );
}

export function DiagramLegend() {
  return (
    <ul className="text-ink-muted flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px]">
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
