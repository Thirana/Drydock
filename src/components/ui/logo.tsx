import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/** The annotator's mark for a dubious move: the whole site in two characters. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "text-accent font-mono text-[0.72em] leading-none font-bold",
        className,
      )}
    >
      ?!
    </span>
  );
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "text-ink inline-flex items-start gap-0.5 text-[19px] font-bold tracking-[-0.02em]",
        className,
      )}
    >
      {site.name}
      <Logo className="mt-[3px]" />
    </Link>
  );
}
