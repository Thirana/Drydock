import type { ReactNode } from "react";
import { mainLinks, startLearning } from "@/lib/content/nav";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Marketing frame: top bar, a 1200px page, footer. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ground text-ink relative flex min-h-screen flex-1 flex-col overflow-x-clip">
      <SiteHeader links={mainLinks()} cta={startLearning()} />
      <main className="relative mx-auto w-full max-w-[1200px] flex-1 px-5 sm:px-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
