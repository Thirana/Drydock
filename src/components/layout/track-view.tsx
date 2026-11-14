import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ReactNode } from "react";
import { architectureMdxComponents } from "@/components/architecture/mdx-components";
import { DiagramDefs } from "@/components/learn/diagram-defs";
import { PageRoute } from "@/components/layout/page-route";
import { ViewGuide, ViewGuideItem } from "@/components/layout/view-guide";
import { HarbourPhases } from "@/components/site/landing/harbour-phases";
import { ICONS } from "@/components/ui/icons";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/icons";
import { SearchMeta } from "@/components/site/search-meta";
import { lessonsByDefect } from "@/lib/content/crosslinks";
import { courseHref, getCourse } from "@/lib/content/learn";
import { viewHref, type TrackContext } from "@/lib/content/registry";
import type { TrackView as TrackViewData } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** One view: header, then its MDX with the components its track's data supports, then the next view. */
export function TrackView({
  ctx,
  view,
}: {
  ctx: TrackContext;
  view: TrackViewData;
}) {
  const views = ctx.track.views;
  const index = views.findIndex((v) => v.slug === view.slug);
  const isIndex = index === 0;
  const components: MDXComponents = {
    ...(ctx.track.architecture &&
      architectureMdxComponents(
        ctx.track.architecture,
        { defects: viewHref(ctx, "defects") },
        lessonsByDefect(ctx.track.architecture.defects),
      )),
    ViewGuide,
    ViewGuideItem: ({
      view: slug,
      children,
    }: {
      view: string;
      children: ReactNode;
    }) => {
      const at = views.findIndex((v) => v.slug === slug);
      const target = views[at];
      if (!target) throw new Error(`ViewGuideItem: no view "${slug}"`);
      return (
        <ViewGuideItem
          href={viewHref(ctx, target.slug)}
          title={target.title}
          frame={at + 1}
          icon={target.icon && ICONS[target.icon]}
        >
          {children}
        </ViewGuideItem>
      );
    },
  };
  const { Content } = view;
  // A provider's labs are taught by the course of the same name.
  const course = getCourse(ctx.provider.slug);
  const model = ctx.track.architecture;
  // The phase-stepped drawing is Harbour's own front door.
  const drawing = isIndex && model && ctx.lab.slug === "harbour";

  return (
    <main className="relative flex min-w-0 flex-1 flex-col">
      <header className="mx-auto grid w-full max-w-[1200px] items-center gap-x-12 gap-y-12 px-5 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-12">
        <div className={cn("max-w-[760px]", drawing && "lg:col-span-6")}>
          <h1 className="dd-head animate-rise text-ink text-[38px] sm:text-[48px]">
            {isIndex ? ctx.track.heading : view.title}
          </h1>
          <p className="text-ink-body mt-4 text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
            {isIndex ? ctx.track.summary : (view.lead ?? view.description)}
          </p>
          {course && (
            <p className="text-ink-muted mt-3 text-[15.5px] leading-[1.5]">
              New to this? Learn it first in{" "}
              <Link href={courseHref(course)} className="dd-link">
                {course.title}
              </Link>
              .
            </p>
          )}
          {isIndex && (
            <dl className="border-rule mt-8 border-t">
              {ctx.track.meta.map((m) => (
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
          )}
        </div>
        {drawing && <DiagramDefs />}
        {drawing && (
          <figure className="hidden min-w-0 md:block lg:col-span-6 lg:w-full lg:max-w-[600px] lg:justify-self-end">
            <HarbourPhases
              phases={model.phases.map(({ number, name }) => ({
                number,
                name,
              }))}
              trims={model.defects.map(({ id, phase }) => ({ id, phase }))}
            />
            <figcaption className="text-ink-muted mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-pretty">
              {ctx.lab.title}’s front door, phase by phase. The Map tab draws
              the whole platform.
            </figcaption>
          </figure>
        )}
      </header>

      <article
        data-pagefind-body
        className="gl-prose relative mx-auto w-full max-w-[1200px] flex-1 px-5 pt-10 pb-20 sm:px-8 sm:pt-14"
      >
        <SearchMeta
          title={isIndex ? ctx.track.heading : view.title}
          where={`${ctx.lab.title} · ${ctx.track.title}`}
        />
        {isIndex ? (
          <div className="grid gap-x-16 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div id="track-body" className="min-w-0">
              <Content components={components} />
            </div>
            <aside className="not-prose hidden lg:block">
              <div className="sticky top-24">
                <PageRoute container="track-body" />
              </div>
            </aside>
          </div>
        ) : (
          <Content components={components} />
        )}
      </article>

      <Pager
        prev={index > 0 ? { view: views[index - 1], n: index } : undefined}
        next={
          views[index + 1]
            ? { view: views[index + 1], n: index + 2 }
            : undefined
        }
        hrefOf={(slug) => viewHref(ctx, slug)}
        disclaimer={ctx.lab.disclaimer}
      />
    </main>
  );
}

interface PagerTarget {
  view: TrackViewData;
  n: number;
}

/** The moves either side of this one, so a track reads start to finish. */
function Pager({
  prev,
  next,
  hrefOf,
  disclaimer,
}: {
  prev?: PagerTarget;
  next?: PagerTarget;
  hrefOf: (slug: string) => string;
  disclaimer?: string;
}) {
  return (
    <nav
      aria-label="Track views"
      className="mx-auto w-full max-w-[1200px] px-5 pb-20 sm:px-8"
    >
      <div className="border-rule grid gap-8 border-t pt-8 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          {prev && (
            <Link
              href={hrefOf(prev.view.slug)}
              rel="prev"
              className="group text-ink-muted hover:text-ink inline-flex items-center gap-2 text-[16px] transition-colors"
            >
              <IconArrowLeft size={12} />
              <span className="font-mono text-[14px]">{prev.n}.</span>
              {prev.view.title}
            </Link>
          )}
          {disclaimer && (
            <p className="text-ink-muted text-[15px]">{disclaimer}</p>
          )}
        </div>
        {next ? (
          <Link
            href={hrefOf(next.view.slug)}
            rel="next"
            className="group flex flex-col gap-1.5 sm:items-end sm:text-right"
          >
            <span className="dd-head text-accent inline-flex items-center gap-3 text-[28px]">
              <span className="text-ink-faint font-mono text-[22px]">
                {next.n}.
              </span>
              {next.view.title}
              <IconArrowRight
                size={12}
                className="size-5 transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
            <span className="text-ink-body max-w-[48ch] text-[16px] leading-[1.55] text-pretty">
              {next.view.description}
            </span>
          </Link>
        ) : (
          <p className="text-ink-body text-[16px] sm:text-right">
            That is the whole track. Pick a phase on the map and walk it again.
          </p>
        )}
      </div>
    </nav>
  );
}
