import { PageShell } from "@/components/site/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <PageShell>
      <section className="max-w-[640px] py-24 sm:py-32">
        <p className="text-fault font-mono text-[20px] font-bold">404??</p>
        <h1 className="dd-head text-ink mt-3 text-[44px]">
          Nothing at this address
        </h1>
        <p className="text-ink-body mt-4 text-[19px] leading-[1.55]">
          The page may have moved, or the link was mistyped.
        </p>
        <ButtonLink
          href="/"
          size="lg"
          className="mt-8"
          trailing={<IconArrow size={14} />}
        >
          Back to the start
        </ButtonLink>
      </section>
    </PageShell>
  );
}
