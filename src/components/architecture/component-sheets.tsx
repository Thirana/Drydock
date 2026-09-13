import { boxIndex } from "@/lib/architecture/state";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { DefectLink } from "./defect-link";
import { FactList } from "./fact-list";

/** Every component sheet as a card, grouped by section. */
export function ComponentSheets({
  model,
  defectsHref,
}: {
  model: ArchitectureModel;
  defectsHref: string;
}) {
  const boxes = boxIndex(model);
  const sheets = Object.entries(model.componentSheets);

  return (
    <div className="not-prose space-y-10">
      {model.componentSections.map((section) => {
        const rows = sheets.filter(([, sheet]) => sheet.section === section);
        if (!rows.length) return null;
        return (
          <section key={section}>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-gl-text text-[16px] font-bold tracking-[-0.015em]">
                {section}
              </h3>
              <span className="text-gl-text-faint font-mono text-[11px]">
                {rows.length}
              </span>
              <div
                aria-hidden="true"
                className="border-gl-border flex-1 border-t"
              />
            </div>
            <div className="grid gap-3.5 lg:grid-cols-2">
              {rows.map(([id, sheet]) => {
                const box = boxes.get(id);
                return (
                  <article
                    key={id}
                    className="border-gl-border bg-gl-surface shadow-gl flex flex-col rounded-xl border p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-gl-text text-[15px] font-bold tracking-[-0.015em]">
                          {box?.label ?? id}
                        </h4>
                        {box?.sub && (
                          <p className="text-gl-text-muted mt-0.5 font-mono text-[11.5px]">
                            {box.sub}
                          </p>
                        )}
                      </div>
                      {box?.defects && (
                        <div className="flex flex-wrap gap-1.5">
                          {box.defects.map((d) => (
                            <DefectLink
                              key={d}
                              id={d}
                              defectsHref={defectsHref}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-gl-text-muted mt-3 text-[13.5px] leading-[1.6] text-pretty">
                      {sheet.purpose}
                    </p>
                    <div className="border-gl-border mt-4 border-t">
                      <FactList facts={sheet.facts} compact />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
