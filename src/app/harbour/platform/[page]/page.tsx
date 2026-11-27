import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformView } from "@/components/harbour/platform-view";
import { getPlatformPage, harbour } from "@/lib/content/harbour";

export const dynamicParams = false;

export function generateStaticParams() {
  // The first page is served at /harbour/platform, so it gets no route of its own.
  return harbour.platform.slice(1).map((p) => ({ page: p.slug }));
}

async function resolve(
  params: PageProps<"/harbour/platform/[page]">["params"],
) {
  const { page } = await params;
  const found = getPlatformPage(page);
  return found && found !== harbour.platform[0] ? found : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/harbour/platform/[page]">): Promise<Metadata> {
  const page = await resolve(params);
  return page
    ? {
        title: `${page.title} · ${harbour.title}`,
        description: page.description,
      }
    : {};
}

export default async function PlatformPageRoute({
  params,
}: PageProps<"/harbour/platform/[page]">) {
  const page = await resolve(params);
  if (!page) notFound();
  return <PlatformView page={page} />;
}
