import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Fragment } from "react";
import { architectureMdxComponents } from "@/components/architecture/mdx-components";
import {
  labHref,
  providerHref,
  trackHref,
  viewHref,
  type TrackContext,
} from "@/lib/content/registry";
import type { TrackView as TrackViewData } from "@/lib/content/types";

/** One view: top bar, then its MDX with the components its track's data supports. */
export function TrackView({
  ctx,
  view,
}: {
  ctx: TrackContext;
  view: TrackViewData;
}) {
  const isIndex = view.slug === ctx.track.views[0].slug;
  const components: MDXComponents = {
    ...(ctx.track.architecture &&
      architectureMdxComponents(ctx.track.architecture, {
        defects: viewHref(ctx, "defects"),
      })),
  };
  const crumbs = [
    { href: providerHref(ctx.provider), label: ctx.provider.name },
    { href: labHref(ctx), label: ctx.lab.title },
    { href: trackHref(ctx), label: ctx.track.title },
  ];
  const { Content } = view;

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="border-gl-border border-b px-5 pt-7 pb-6 sm:px-8">
        <nav
          aria-label="Breadcrumb"
          className="text-gl-text-faint mb-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase"
        >
          {crumbs.map((crumb, i) => (
            <Fragment key={crumb.href}>
              {i > 0 && <span aria-hidden="true">/</span>}
              <Link
                href={crumb.href}
                className="hover:text-gl-text-muted transition-colors"
              >
                {crumb.label}
              </Link>
            </Fragment>
          ))}
          {!isIndex && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-gl-text-muted">
                {view.title}
              </span>
            </>
          )}
        </nav>
        <h1 className="text-gl-text text-[26px] leading-tight font-bold tracking-[-0.022em] text-balance sm:text-[28px]">
          {isIndex ? ctx.track.heading : view.title}
        </h1>
        {isIndex && (
          <>
            <p className="text-gl-text-muted mt-2 max-w-[760px] text-[14.5px] leading-relaxed text-pretty">
              {ctx.track.summary}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ctx.track.meta.map((m) => (
                <li
                  key={m.label}
                  className="border-gl-border bg-gl-surface inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px]"
                >
                  <span className="text-gl-text-faint font-mono">
                    {m.label}
                  </span>
                  <span className="text-gl-text-muted">{m.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </header>

      <article className="gl-prose mx-auto w-full max-w-[1400px] flex-1 px-5 py-8 pb-20 sm:px-8">
        <Content components={components} />
      </article>
    </main>
  );
}
