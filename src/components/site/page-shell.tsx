import type { ReactNode } from "react";
import { getFeaturedTrack } from "@/lib/content/featured";
import { providerHref, providers } from "@/lib/content/registry";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Marketing frame: top bar, a 1200px page, footer. */
export function PageShell({ children }: { children: ReactNode }) {
  const featured = getFeaturedTrack();
  const links = [
    { href: "/#labs", label: "Labs" },
    ...(featured ? [{ href: "/#score", label: "How it works" }] : []),
    ...providers.map((p) => ({ href: providerHref(p), label: p.name })),
  ];
  const cta = featured
    ? { href: featured.href, label: `Open ${featured.lab}` }
    : undefined;

  return (
    <div className="bg-ground text-ink relative flex min-h-screen flex-1 flex-col overflow-x-clip">
      <SiteHeader links={links} cta={cta} />
      <main className="relative mx-auto w-full max-w-[1200px] flex-1 px-5 sm:px-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
