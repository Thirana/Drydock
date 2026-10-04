import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ReactNode } from "react";
import { architectureMdxComponents } from "@/components/architecture/mdx-components";
import { ViewGuide, ViewGuideItem } from "@/components/layout/view-guide";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/icons";
import { viewHref, type TrackContext } from "@/lib/content/registry";
import type { TrackView as TrackViewData } from "@/lib/content/types";

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
      architectureMdxComponents(ctx.track.architecture, {
        defects: viewHref(ctx, "defects"),
      })),
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
        >
          {children}
        </ViewGuideItem>
      );
    },
  };
  const { Content } = view;

  return (
    <main className="relative flex min-w-0 flex-1 flex-col">
      <header className="mx-auto w-full max-w-[1200px] px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="max-w-[760px]">
          <h1 className="dd-head animate-rise text-ink text-[38px] sm:text-[48px]">
            {isIndex ? ctx.track.heading : view.title}
          </h1>
          <p className="text-ink-body mt-4 text-[19px] leading-[1.55] text-pretty sm:text-[20px]">
            {isIndex ? ctx.track.summary : (view.lead ?? view.description)}
          </p>
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
      </header>

      <article className="gl-prose relative mx-auto w-full max-w-[1200px] flex-1 px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
        <Content components={components} />
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
