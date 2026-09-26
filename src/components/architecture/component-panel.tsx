import { GlButton } from "@/components/ui/button";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/icons";
import { boxIndex } from "@/lib/architecture/state";
import type { ArchitectureModel } from "@/lib/architecture/types";
import { DefectLink } from "./defect-link";
import { FactList } from "./fact-list";

const LABEL = "dd-label text-ink-muted";

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
    <div key={id} className="animate-fade-in">
      <div className="flex items-start justify-between gap-4 pt-4 pb-5">
        <div className="min-w-0">
          <h3 className="dd-head text-ink text-[26px]">{box.label}</h3>
          <p className="text-ink-muted mt-1.5 text-[15px]">
            {sheet.section}
            {box.sub && <> · {box.sub}</>}
          </p>
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

      <div className="grid gap-x-12 gap-y-8 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <p className="text-ink text-[17px] leading-[1.6] text-pretty">
            {sheet.purpose}
          </p>
          <div className="border-rule mt-5 border-t">
            <FactList facts={sheet.facts} />
          </div>
        </div>

        <div className="space-y-7 xl:col-span-5">
          {talksTo.length > 0 && (
            <div>
              <p className={LABEL}>Talks to</p>
              <ul className="divide-rule border-rule mt-2 divide-y border-y">
                {talksTo.map((link, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 py-2 text-[15px]"
                  >
                    <span
                      aria-label={link.direction}
                      className="text-ink-muted inline-flex w-4 self-center"
                    >
                      {link.direction === "to" ? (
                        <IconArrowRight size={12} />
                      ) : (
                        <IconArrowLeft size={12} />
                      )}
                    </span>
                    <span className="text-ink font-medium">{link.name}</span>
                    {link.label && (
                      <span className="text-ink-muted font-mono text-[13.5px]">
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
              <p className={LABEL}>Defects here</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {box.defects.map((d) => (
                  <DefectLink key={d} id={d} defectsHref={defectsHref} />
                ))}
              </div>
            </div>
          )}

          {changes.length > 0 && (
            <div>
              <p className={LABEL}>Changes by phase</p>
              <ul className="divide-rule border-rule mt-2 divide-y border-y">
                {changes.map((d) => (
                  <li
                    key={d.id}
                    className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-baseline gap-3 py-2 text-[15px]"
                  >
                    <span className="text-ink-faint font-mono text-[14px] font-bold">
                      {d.phase}.
                    </span>
                    <span className="text-ink-body">
                      {d.applies[id].sub ?? "appearance only"}
                    </span>
                    <span className="text-ink-muted font-mono text-[13.5px]">
                      {d.id}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
