import type { Metadata } from "next";
import { architectureMdxComponents } from "@/components/architecture/mdx-components";
import { Origin, Origins } from "@/components/harbour/origins";
import { Glance, Path, Paths } from "@/components/harbour/overview-parts";
import { PageHeader } from "@/components/harbour/page-header";
import { Pager } from "@/components/harbour/pager";
import { PageRoute } from "@/components/layout/page-route";
import { WaysIn } from "@/components/harbour/ways-in";
import { SearchMeta } from "@/components/site/search-meta";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { harbour, journeysHref, sections } from "@/lib/content/harbour";

export const metadata: Metadata = {
  title: `${harbour.title}, a case study`,
  description: harbour.summary,
};

/** The case study's front page: who Harbour is, how it got this way, how to read the rest. */
export default function HarbourOverview() {
  const model = harbour.architecture;
  const [, platform] = sections;
  const { Overview } = harbour;
  const components = {
    ...architectureMdxComponents(model),
    Origins,
    Origin,
    Glance,
    Paths,
    Path,
  };

  return (
    <>
      <PageHeader
        large
        eyebrow={`Case study · ${harbour.kind}`}
        title={harbour.heading}
        lead={harbour.summary}
        asideClassName="hidden md:block lg:w-[min(46vw,560px)]"
        aside={
          <figure>
            <WaysIn />
            <figcaption className="text-ink-muted mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-pretty">
              Every way into {harbour.title} from the internet. Red goes
              straight in, with nothing checking it on the way. The IDs are the
              defects that leave each door open.
            </figcaption>
          </figure>
        }
      >
        <dl className="border-rule mt-8 border-t">
          {harbour.meta.map((m) => (
            <div
              key={m.label}
              className="border-rule grid gap-0.5 border-b py-2.5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
            >
              <dt className="text-ink-muted text-[15px]">{m.label}</dt>
              <dd className="text-ink text-[15.5px] leading-[1.5]">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <ButtonLink
            href={platform.href}
            size="lg"
            trailing={<IconArrow size={14} />}
          >
            Start with the platform
          </ButtonLink>
          <ButtonLink href={journeysHref} variant="ghost" size="lg">
            Follow a packet
          </ButtonLink>
        </div>
      </PageHeader>

      <article
        data-pagefind-body
        className="gl-prose relative mx-auto w-full max-w-[1200px] flex-1 px-5 pt-14 pb-20 sm:px-8 sm:pt-20"
      >
        <SearchMeta title={harbour.title} where="Case study" />
        <div className="grid gap-x-16 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div id="overview-body" className="min-w-0">
            <Overview components={components} />
          </div>
          <aside className="not-prose hidden lg:block">
            <div className="sticky top-24">
              <PageRoute container="overview-body" />
            </div>
          </aside>
        </div>
      </article>

      <Pager
        next={{
          href: platform.href,
          label: platform.label,
          mark: "2.",
          description: platform.description,
        }}
        note={harbour.disclaimer}
      />
    </>
  );
}
