import type { Metadata } from "next";
import Link from "next/link";
import { LabList } from "@/components/site/lab-list";
import { PageShell } from "@/components/site/page-shell";
import { courseHref, courses } from "@/lib/content/learn";
import { allLabs } from "@/lib/content/registry";

const LEAD =
  "Deliberately broken cloud architectures, and how to fix them step by step. Each lab is one fictional platform, and every track opens as found.";

export const metadata: Metadata = { title: "Labs", description: LEAD };

export default function LabsPage() {
  const gcp = courses.find((c) => c.slug === "gcp");
  return (
    <PageShell>
      <section className="pt-12 pb-12 sm:pt-16 lg:pt-20">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12 lg:items-end">
          <h1 className="dd-head animate-rise text-ink text-[52px] sm:text-[64px] lg:col-span-6 lg:text-[76px]">
            Labs
          </h1>
          <div className="lg:col-span-6 lg:pb-3">
            <p className="text-ink-body max-w-[46ch] text-[20px] leading-[1.5] text-pretty">
              {LEAD}
            </p>
            {gcp && (
              <p className="text-ink-muted mt-3 max-w-[52ch] text-[16px] leading-[1.55]">
                New to this? Every defect links to the chapter that teaches it,
                in{" "}
                <Link href={courseHref(gcp)} className="dd-link">
                  {gcp.title}
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Labs" className="pb-20 sm:pb-24">
        <LabList labs={allLabs()} showProvider />
      </section>
    </PageShell>
  );
}
