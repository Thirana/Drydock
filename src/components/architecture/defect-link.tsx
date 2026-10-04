import Link from "next/link";
import type { ReactNode } from "react";

/** A defect reference, set like a move in the score: mono, red, underlined on hover. */
export const DEFECT_CHIP =
  "not-prose inline-flex items-center whitespace-nowrap font-mono text-[14px] font-bold text-fault underline decoration-dotted decoration-[1.5px] underline-offset-4 transition-colors hover:decoration-solid";

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
