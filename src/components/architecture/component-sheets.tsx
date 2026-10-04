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
    <div className="not-prose space-y-16">
      {model.componentSections.map((section) => {
        const rows = sheets.filter(([, sheet]) => sheet.section === section);
        if (!rows.length) return null;
        return (
          <section key={section}>
            <div className="border-rule flex items-baseline justify-between gap-3 border-t pt-4">
              <h3 className="dd-head text-ink text-[24px]">{section}</h3>
              <span className="text-ink-muted font-mono text-[14px]">
                {rows.length} {rows.length === 1 ? "component" : "components"}
              </span>
            </div>
            <div className="grid gap-x-12 lg:grid-cols-2">
              {rows.map(([id, sheet]) => {
                const box = boxes.get(id);
                return (
                  <article
                    key={id}
                    className="border-rule flex flex-col border-b py-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <div className="min-w-0">
                        <h4 className="text-ink text-[19px] leading-[1.25] font-bold">
                          {box?.label ?? id}
                        </h4>
                        {box?.sub && (
                          <p className="text-ink-muted mt-1 font-mono text-[14px]">
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
                    <p className="text-ink-body mt-3 text-[16px] leading-[1.55] text-pretty">
                      {sheet.purpose}
                    </p>
                    <div className="border-rule mt-4 border-t">
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
