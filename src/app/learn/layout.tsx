import type { ReactNode } from "react";
import { DiagramDefs } from "@/components/learn/diagram-defs";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { mainLinks } from "@/lib/content/nav";

/** The courses' frame: the site's top bar, the page, the footer, and the drawings' arrowheads. */
export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ground text-ink flex min-h-screen flex-1 flex-col">
      <DiagramDefs />
      <SiteHeader links={mainLinks()} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
