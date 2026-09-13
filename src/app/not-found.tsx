import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { IconArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <PageShell>
      <section className="flex flex-col items-center gap-2 px-6 py-24 text-center sm:py-32">
        <span
          aria-hidden="true"
          className="text-gl-border font-mono text-[64px] leading-none font-bold"
        >
          404
        </span>
        <h1 className="text-gl-text mt-4 text-[26px] leading-tight font-bold tracking-[-0.02em]">
          Page not found
        </h1>
        <p className="text-gl-text-muted max-w-[320px] text-[14px] leading-relaxed">
          There’s nothing at this address.
        </p>
        <Link
          href="/"
          className="text-gl-primary hover:text-gl-primary-hover mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold"
        >
          Back to home <IconArrowRight size={12} />
        </Link>
      </section>
    </PageShell>
  );
}
