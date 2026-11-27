import Link from "next/link";
import { architectureMdxComponents } from "@/components/architecture/mdx-components";
import { SearchMeta } from "@/components/site/search-meta";
import { ICONS } from "@/components/ui/icons";
import {
  harbour,
  harbourHref,
  platformPageHref,
  sections,
} from "@/lib/content/harbour";
import type { PlatformPage } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";
import { Pager } from "./pager";

/** One page of the platform section: its header with the section's pages, its MDX, the way on. */
export function PlatformView({ page }: { page: PlatformPage }) {
  const pages = harbour.platform;
  const index = pages.findIndex((p) => p.slug === page.slug);
  const prev = pages[index - 1];
  const next = pages[index + 1];
  const journeys = sections[2];
  const { Content } = page;

  return (
    <>
      <PageHeader
        eyebrow={`Platform · ${index + 1} of ${pages.length}`}
        title={page.title}
        lead={page.lead ?? page.description}
      >
        <nav aria-label="Platform pages" className="mt-7">
          <ol className="flex flex-wrap gap-x-6 gap-y-2">
            {pages.map((p, i) => {
              const Icon = p.icon && ICONS[p.icon];
              const current = p.slug === page.slug;
              return (
                <li key={p.slug}>
                  <Link
                    href={platformPageHref(p.slug)}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2 border-b-2 text-[15.5px] transition-colors",
                      current
                        ? "border-accent text-accent font-bold"
                        : "text-ink-muted hover:text-ink border-transparent",
                    )}
                  >
                    {Icon && <Icon size={14} />}
                    <span className="font-mono text-[13px]">{i + 1}.</span>
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </PageHeader>

      <article
        data-pagefind-body
        className="gl-prose relative mx-auto w-full max-w-[1200px] flex-1 px-5 pt-10 pb-20 sm:px-8 sm:pt-14"
      >
        <SearchMeta title={page.title} where={`${harbour.title} · Platform`} />
        <Content components={architectureMdxComponents(harbour.architecture)} />
      </article>

      <Pager
        prev={
          prev
            ? { href: platformPageHref(prev.slug), label: prev.title }
            : { href: harbourHref, label: "Overview" }
        }
        next={
          next
            ? {
                href: platformPageHref(next.slug),
                label: next.title,
                mark: `${index + 2}.`,
                description: next.description,
              }
            : {
                href: journeys.href,
                label: journeys.label,
                description: journeys.description,
              }
        }
        note={harbour.disclaimer}
      />
    </>
  );
}
