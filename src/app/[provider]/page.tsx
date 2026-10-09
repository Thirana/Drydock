import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabList } from "@/components/site/lab-list";
import { PageShell } from "@/components/site/page-shell";
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
        <LabList labs={provider.labs.map((lab) => ({ provider, lab }))} />
      </section>
    </PageShell>
  );
}
