import type { ReactNode } from "react";
import { getFeaturedTrack } from "@/lib/content/featured";
import { providerHref, providers } from "@/lib/content/registry";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const HALO = `
  radial-gradient(70% 45% at 50% 0%, rgba(111, 200, 160, 0.16) 0%, transparent 65%),
  radial-gradient(45% 35% at 50% 25%, rgba(242, 234, 211, 0.04) 0%, transparent 80%),
  linear-gradient(to bottom, transparent 55%, var(--gl-bg) 100%)
`;

/** Marketing frame: halo, sticky nav, centred 1200px column, footer. */
export function PageShell({ children }: { children: ReactNode }) {
  const featured = getFeaturedTrack();
  const links = [
    { href: featured ? "/#healthy" : "/#labs", label: "Labs" },
    ...(featured ? [{ href: "/#as-found", label: "How it works" }] : []),
    ...providers.map((p) => ({ href: providerHref(p), label: p.name })),
  ];
  const cta = featured
    ? { href: featured.href, label: `Open ${featured.lab}` }
    : { href: "/#labs", label: "Browse labs" };

  return (
    <div className="bg-gl-bg text-gl-text relative flex min-h-screen flex-1 flex-col overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[1100px]"
        style={{ background: HALO }}
      />
      <SiteHeader links={links} cta={cta} />
      <main className="relative z-10 mx-auto w-full max-w-[1200px] flex-1 px-5 sm:px-8 lg:px-12">
        {children}
      </main>
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <SiteFooter />
      </div>
    </div>
  );
}
