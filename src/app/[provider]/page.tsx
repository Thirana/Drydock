import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabCard } from "@/components/site/lab-card";
import { PageShell } from "@/components/site/page-shell";
import { Eyebrow } from "@/components/ui/typography";
import { getProvider, providers } from "@/lib/content/registry";

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
      <section className="pt-12 pb-10 sm:pt-16">
        <Eyebrow>Provider</Eyebrow>
        <h1 className="text-gl-text mt-3 text-[36px] leading-[1.08] font-bold tracking-[-0.025em] text-balance sm:text-[44px] sm:tracking-[-0.028em]">
          {provider.name}
        </h1>
        <p className="text-gl-text-muted mt-4 max-w-[640px] text-[17px] leading-[1.55] text-pretty">
          {provider.summary}
        </p>
      </section>
      <section className="pb-16 sm:pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {provider.labs.map((lab) => (
            <LabCard key={lab.slug} ctx={{ provider, lab }} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
