import Link from "next/link";
import { cn } from "@/lib/utils";

interface Phase {
  number: number;
  name: string;
}

interface Trim {
  id: string;
  title: string;
  severity: string;
  phase: number;
  blockedBy: string[];
}

/**
 * A lab's defects as the route it is fixed along: a stop per phase, and under
 * each the defects that close there, with what each one waits for. The order
 * is the lab's argument, so it is the page's shape.
 */
export function DefectRoute({
  phases,
  trims,
  defectsHref,
}: {
  phases: Phase[];
  trims: Trim[];
  defectsHref: string;
}) {
  const stops = phases.filter((p) => p.number > 0);
  const half = Math.ceil(stops.length / 2);
  const columns = [stops.slice(0, half), stops.slice(half)];

  return (
    <div className="grid gap-x-16 lg:grid-cols-2">
      {columns.map((column, c) => (
        <ol key={c}>
          {column.map((p, i) => {
            const closing = trims.filter((t) => t.phase === p.number);
            const last = i === column.length - 1;
            return (
              <li
                key={p.number}
                className="relative grid grid-cols-[28px_1fr] gap-x-4"
              >
                {!last && (
                  <span
                    aria-hidden="true"
                    className="bg-rule-strong absolute top-8 bottom-1 left-[13.5px] w-px"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="border-ink bg-ground text-ink relative grid size-7 place-items-center rounded-full border font-mono text-[13px] font-bold"
                >
                  {p.number}
                </span>
                <div className="pb-10">
                  <h3 className="text-ink pt-0.5 text-[19px] leading-[1.3] font-bold">
                    {p.name}
                  </h3>
                  <p className="text-ink-muted mt-0.5 text-[14px]">
                    Phase {p.number} · closes {closing.length}
                  </p>
                  <ul className="border-rule mt-3 border-t">
                    {closing.map((d) => (
                      <li key={d.id} className="border-rule border-b">
                        <Link
                          href={`${defectsHref}#${d.id}`}
                          className="group grid grid-cols-[44px_minmax(0,1fr)] items-baseline gap-x-2 py-2.5"
                        >
                          <span className="text-fault font-mono text-[14px] font-bold">
                            {d.id}
                          </span>
                          <span className="min-w-0">
                            <span className="text-ink group-hover:text-accent block text-[16px] leading-[1.4] transition-colors">
                              {d.title}
                            </span>
                            <span className="text-ink-muted mt-0.5 block text-[13.5px]">
                              <span
                                className={cn(
                                  d.severity === "critical" &&
                                    "text-fault font-semibold",
                                )}
                              >
                                {d.severity}
                              </span>
                              {d.blockedBy.length > 0 && (
                                <>
                                  {" "}
                                  · after{" "}
                                  {d.blockedBy.map((id, k) => (
                                    <span key={id}>
                                      {k > 0 && ", "}
                                      <span className="font-mono">{id}</span>
                                    </span>
                                  ))}
                                </>
                              )}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      ))}
    </div>
  );
}
