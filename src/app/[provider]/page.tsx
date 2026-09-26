import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/page-shell";
import { StatPills } from "@/components/site/stat-pills";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { getProvider, labHref, providers } from "@/lib/content/registry";
import { labStats } from "@/lib/content/stats";

export const dynamicParams = false;

export function generateStaticParams() {
  return providers.map((p) => ({ provider: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[provider]">): Promise<Metadata> {
  const provider = getProvider((await params).provider);
  return provider
    ? { title: provider.name, description: provider.summary }
    : {};
}

export default async function ProviderPage({
  params,
}: PageProps<"/[provider]">) {
  const provider = getProvider((await params).provider);
  if (!provider) notFound();

  return (
    <PageShell>
      <section className="pt-12 pb-12 sm:pt-16 lg:pt-20">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12 lg:items-end">
          <h1 className="dd-head animate-rise text-ink text-[52px] sm:text-[64px] lg:col-span-8 lg:text-[76px]">
            {provider.name}
          </h1>
          <p className="text-ink-body max-w-[40ch] text-[20px] leading-[1.5] text-pretty lg:col-span-4 lg:pb-3">
            {provider.summary}
          </p>
        </div>
      </section>

      <section aria-label="Labs" className="pb-20 sm:pb-24">
        <ul className="border-rule border-t">
          {provider.labs.map((lab, i) => {
            const ctx = { provider, lab };
            const stats = labStats(lab);
            return (
              <li
                key={lab.slug}
                className="border-rule grid gap-8 border-b py-10 lg:grid-cols-12 lg:items-end"
              >
                <div className="lg:col-span-8">
                  <span className="text-ink-faint font-mono text-[18px] font-bold">
                    {i + 1}.
                  </span>
                  <h2 className="dd-head text-ink mt-1 text-[36px]">
                    {lab.title}
                  </h2>
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
      </section>
    </PageShell>
  );
}
