import type { ReactNode } from "react";
import { DefectLink } from "@/components/architecture/defect-link";
import { Fold, Folds } from "@/components/mdx/fold";

/**
 * How the platform got this way: a row per decision, its title and the
 * defects it left behind always up, the story folded.
 */
export function Origins({ children }: { children: ReactNode }) {
  return <Folds>{children}</Folds>;
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
    <Fold
      name="origins"
      wideMark
      mark={when}
      title={title}
      meta={
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-ink-muted text-[14px]">Left behind</span>
          {defects.map((id) => (
            <DefectLink key={id} id={id} />
          ))}
        </span>
      }
    >
      {children}
    </Fold>
  );
}
