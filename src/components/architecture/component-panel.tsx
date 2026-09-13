import { GlButton } from "@/components/ui/button";
import { IconArrowLeft } from "@/components/ui/icons";
import { boxIndex } from "@/lib/architecture/state";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { DefectLink } from "./defect-link";
import { FactList } from "./fact-list";

const EYEBROW =
  "text-gl-text-faint text-[10px] font-bold tracking-[0.12em] uppercase";

/** One component sheet, with what it talks to and how it changes by phase. */
export function ComponentPanel({
  model,
  id,
  defectsHref,
  onBack,
}: {
  model: ArchitectureModel;
  id: string;
  defectsHref: string;
  onBack: () => void;
}) {
  const boxes = boxIndex(model);
  const box = boxes.get(id);
  const sheet = model.componentSheets[id];
  if (!box || !sheet) return null;

  const talksTo = model.edges.flatMap((e) => {
    const links: { direction: "to" | "from"; name: string; label?: string }[] =
      [];
    const target = boxes.get(e.to);
    const source = boxes.get(e.from);
    if (e.from === id && target)
      links.push({ direction: "to", name: target.label, label: e.label });
    if (e.to === id && source)
      links.push({ direction: "from", name: source.label, label: e.label });
    return links;
  });
  const changes = model.defects
    .filter((d) => d.applies[id])
    .sort((a, b) => a.phase - b.phase);

  return (
    <>
      <div className="border-gl-border flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className={EYEBROW}>{sheet.section}</p>
          <h3 className="text-gl-text mt-1 text-[18px] leading-snug font-bold tracking-[-0.018em]">
            {box.label}
          </h3>
          {box.sub && (
            <p className="text-gl-text-muted mt-0.5 font-mono text-[11.5px]">
              {box.sub}
            </p>
          )}
        </div>
        <GlButton
          variant="ghost"
          size="sm"
          onClick={onBack}
          leading={<IconArrowLeft size={12} />}
        >
          Overview
        </GlButton>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.25fr_1fr] xl:gap-8">
        <div>
          <p className="text-gl-text-muted text-[14.5px] leading-[1.65] text-pretty">
            {sheet.purpose}
          </p>
          <div className="mt-4">
            <FactList facts={sheet.facts} />
          </div>
        </div>

        <div className="space-y-6">
          {talksTo.length > 0 && (
            <div>
              <p className={EYEBROW}>Talks to</p>
              <ul className="mt-2.5 space-y-2">
                {talksTo.map((link, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center gap-2 text-[13px]"
                  >
                    <span
                      aria-label={link.direction}
                      className="bg-gl-surface-2 text-gl-text-muted inline-flex size-5 items-center justify-center rounded-[5px] font-mono text-[11px]"
                    >
                      {link.direction === "to" ? "→" : "←"}
                    </span>
                    <span className="text-gl-text font-medium">
                      {link.name}
                    </span>
                    {link.label && (
                      <span className="text-gl-text-faint font-mono text-[11px]">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {box.defects && box.defects.length > 0 && (
            <div>
              <p className={EYEBROW}>Defects here</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {box.defects.map((d) => (
                  <DefectLink key={d} id={d} defectsHref={defectsHref} />
                ))}
              </div>
            </div>
          )}

          {changes.length > 0 && (
            <div>
              <p className={EYEBROW}>Changes by phase</p>
              <ul className="mt-2.5 space-y-2">
                {changes.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start gap-2.5 text-[13px]"
                  >
                    <span className="bg-gl-primary-soft text-gl-primary rounded-[5px] px-1.5 py-0.5 font-mono text-[10.5px] font-semibold">
                      P{d.phase}
                    </span>
                    <span className="text-gl-text-muted flex-1">
                      {d.applies[id].sub ?? "appearance only"}
                    </span>
                    <span className="text-gl-text-faint font-mono text-[11px]">
                      {d.id}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
