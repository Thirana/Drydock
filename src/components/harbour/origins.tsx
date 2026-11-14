import type { ReactNode } from "react";
import { DefectLink } from "@/components/architecture/defect-link";

/** How the platform got this way: a line down the page, a stop per decision. */
export function Origins({ children }: { children: ReactNode }) {
  return <ol className="not-prose my-10 max-w-[760px]">{children}</ol>;
}

export function Origin({
  when,
  title,
  defects,
  children,
}: {
  when: string;
  title: string;
  /** The defects this decision left behind. */
  defects: string[];
  children: ReactNode;
}) {
  return (
    <li className="group relative grid grid-cols-[96px_minmax(0,1fr)] gap-x-5 sm:grid-cols-[120px_minmax(0,1fr)]">
      <p className="text-ink-muted pt-[3px] text-right text-[14px] font-semibold">
        {when}
      </p>
      <div className="border-rule-strong relative border-l pb-9 pl-6 group-last:pb-0">
        <span
          aria-hidden="true"
          className="border-ink bg-ground absolute top-[7px] -left-[5px] size-[9px] rounded-full border"
        />
        <h3 className="text-ink text-[19px] leading-[1.35] font-bold">
          {title}
        </h3>
        <div className="text-ink-body [&_code]:bg-sunk mt-2 text-[16.5px] leading-[1.6] text-pretty [&_code]:rounded-[2px] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[14.5px]">
          {children}
        </div>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-ink-muted text-[14px]">Left behind</span>
          {defects.map((id) => (
            <DefectLink key={id} id={id} />
          ))}
        </p>
      </div>
    </li>
  );
}
