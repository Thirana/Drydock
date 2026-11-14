import type { ReactNode } from "react";
import { DiagramDefs } from "@/components/learn/diagram-defs";
import { ViewStrip } from "@/components/layout/view-strip";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { harbour, harbourHref, sections } from "@/lib/content/harbour";
import { mainLinks, startLearning } from "@/lib/content/nav";

/** The case study's frame: the top bar, its four parts on a strip, the page. */
export default function HarbourLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ground text-ink flex min-h-screen flex-1 flex-col">
      <DiagramDefs />
      <SiteHeader links={mainLinks()} cta={startLearning()} />
      <ViewStrip
        slate={{ href: harbourHref, title: harbour.title, sub: "Case study" }}
        frames={sections.map((s) => ({
          href: s.href,
          label: s.label,
          exact: s.href === harbourHref,
        }))}
      />
      <main className="relative flex min-w-0 flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
