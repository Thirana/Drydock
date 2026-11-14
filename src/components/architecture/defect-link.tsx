import Link from "next/link";
import type { ReactNode } from "react";
import { defectHref } from "@/lib/content/harbour-routes";

/** A defect reference, set like a move in the score: mono, red, underlined on hover. */
export const DEFECT_CHIP =
  "not-prose inline-flex items-center whitespace-nowrap font-mono text-[14px] font-bold text-fault underline decoration-dotted decoration-[1.5px] underline-offset-4 transition-colors hover:decoration-solid";

/** A defect ID linking to the defect's own page. */
export function DefectLink({
  id,
  children,
}: {
  id: string;
  children?: ReactNode;
}) {
  return (
    <Link className={DEFECT_CHIP} href={defectHref(id)}>
      {children ?? id}
    </Link>
  );
}
