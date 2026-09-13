import Link from "next/link";
import type { ReactNode } from "react";

/** Danger-tinted chip. Shared by links to the register and in-page anchors. */
export const DEFECT_CHIP =
  "not-prose inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-gl-danger/30 bg-gl-danger-soft px-2.5 py-1 font-mono text-[11px] leading-none font-semibold text-gl-danger transition-colors duration-150 hover:border-gl-danger/60";

/** A chip that jumps to a defect's card in the register. */
export function DefectLink({
  id,
  defectsHref,
  children,
}: {
  id: string;
  defectsHref: string;
  children?: ReactNode;
}) {
  return (
    <Link className={DEFECT_CHIP} href={`${defectsHref}#${id}`}>
      {children ?? id}
    </Link>
  );
}
