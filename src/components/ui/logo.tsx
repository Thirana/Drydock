import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/** Four blocks, one knocked out of place — the only accent element. */
export function Logo({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect x="2" y="2" width="8" height="8" rx="2" className="fill-gl-text" />
      <rect x="2" y="12" width="8" height="8" rx="2" className="fill-gl-text" />
      <rect
        x="12"
        y="12"
        width="8"
        height="8"
        rx="2"
        className="fill-gl-text"
      />
      <rect
        x="13"
        y="1"
        width="8"
        height="8"
        rx="2"
        transform="rotate(12 17 5)"
        className="fill-gl-primary"
      />
    </svg>
  );
}

export function LogoLockup({
  size = 22,
  className,
  textClassName,
}: {
  size?: number;
  className?: string;
  textClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <Logo size={size} />
      <span
        className={cn(
          "text-gl-text text-[17px] font-bold tracking-[-0.015em]",
          textClassName,
        )}
      >
        {site.name}
      </span>
    </Link>
  );
}
