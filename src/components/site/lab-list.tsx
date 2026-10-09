import { StatPills } from "@/components/site/stat-pills";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { labHref, type LabContext } from "@/lib/content/registry";
import { labStats } from "@/lib/content/stats";

/** Labs as numbered rows: title, summary, counts, and the way in. */
export function LabList({
  labs,
  showProvider,
}: {
  labs: LabContext[];
  /** Name the provider under each lab, for lists that span providers. */
  showProvider?: boolean;
}) {
  return (
    <ul className="border-rule border-t">
      {labs.map((ctx, i) => {
        const { lab, provider } = ctx;
        const stats = labStats(lab);
        return (
          <li
            key={`${provider.slug}/${lab.slug}`}
            className="border-rule grid gap-8 border-b py-10 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-8">
              <span className="text-ink-faint font-mono text-[18px] font-bold">
                {i + 1}.
              </span>
              <h2 className="dd-head text-ink mt-1 text-[36px]">{lab.title}</h2>
              {showProvider && (
                <p className="text-ink-muted mt-1 text-[15px]">
                  {provider.name}
                </p>
              )}
              <p className="text-ink-body mt-3 max-w-[56ch] text-[17px] leading-[1.55] text-pretty">
                {lab.summary}
                {lab.disclaimer && <> {lab.disclaimer}</>}
              </p>
              {stats && <StatPills stats={stats} className="mt-5" />}
            </div>
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <ButtonLink
                href={labHref(ctx)}
                size="lg"
                trailing={<IconArrow size={14} />}
              >
                Open {lab.title}
              </ButtonLink>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
