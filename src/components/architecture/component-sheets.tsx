import { Fold } from "@/components/mdx/fold";
import { IconChevronDown } from "@/components/ui/icons";
import { boxIndex } from "@/lib/architecture/state";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { DefectLink } from "./defect-link";
import { FactList } from "./fact-list";

/**
 * Every component sheet as a toggle list of toggle lists: a section opens to
 * its components, a component opens to its purpose and facts. Rendered on
 * the server as native <details>, so search finds every sheet while closed.
 */
export function ComponentSheets({ model }: { model: ArchitectureModel }) {
  const boxes = boxIndex(model);
  const sheets = Object.entries(model.componentSheets);

  return (
    <div className="not-prose border-rule my-8 max-w-[860px] border-t">
      {model.componentSections.map((section) => {
        const rows = sheets.filter(([, sheet]) => sheet.section === section);
        if (!rows.length) return null;
        const names = rows.map(([id]) => boxes.get(id)?.label ?? id);
        return (
          <details
            key={section}
            className="group/section border-rule open:border-l-accent border-b border-l-2 border-l-transparent transition-colors duration-300"
          >
            <summary className="hover:bg-sunk/60 grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 py-5 pr-2 pl-4 transition-colors duration-150 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">
                <span className="flex items-baseline gap-3">
                  <h3 className="text-ink group-open/section:text-accent text-[21px] leading-[1.3] font-bold transition-colors">
                    {section}
                  </h3>
                  <span className="text-ink-muted font-mono text-[14px]">
                    {rows.length}
                  </span>
                </span>
                <span className="text-ink-muted mt-1 block text-[15px] leading-[1.5] text-pretty group-open/section:hidden">
                  {names.join(", ")}
                </span>
              </span>
              <IconChevronDown
                size={14}
                className="text-ink-muted mt-2.5 transition-transform duration-200 group-open/section:rotate-180"
              />
            </summary>
            <div className="border-rule ml-4 border-t pb-4">
              {rows.map(([id, sheet], i) => {
                const box = boxes.get(id);
                return (
                  <Fold
                    key={id}
                    name={`components-${section}`}
                    mark={i + 1}
                    title={box?.label ?? id}
                    meta={
                      (box?.sub || box?.defects) && (
                        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          {box?.sub && (
                            <span className="text-ink-muted font-mono text-[14px]">
                              {box.sub}
                            </span>
                          )}
                          {box?.defects?.map((d) => (
                            <DefectLink key={d} id={d} />
                          ))}
                        </span>
                      )
                    }
                  >
                    <p>{sheet.purpose}</p>
                    <div className="border-rule mt-4 border-t">
                      <FactList facts={sheet.facts} compact />
                    </div>
                  </Fold>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
