import type { ReactNode } from "react";
import { DrawingKey, type KeyItem } from "@/components/harbour/drawing-key";

/**
 * A wide case study drawing: its caption and key above, the drawing below in
 * a hairline frame that breaks out of the reading column on large screens.
 * The drawing takes the course figures' vocabulary (`.dd-fig`).
 */
export function DiagramFrame({
  title,
  meta,
  keyItems,
  children,
}: {
  title: string;
  meta?: string;
  /** The key entries the drawing uses. */
  keyItems: KeyItem[];
  children: ReactNode;
}) {
  return (
    <figure data-pagefind-ignore>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-3">
          <span className="text-ink text-[16px] font-bold">{title}</span>
          {meta && <span className="text-ink-muted text-[15px]">{meta}</span>}
        </span>
        <DrawingKey items={keyItems} />
      </figcaption>
      <div className="dd-fig border-rule bg-ground overflow-x-auto rounded-[2px] border lg:mx-[calc(50%-min(50vw,720px)+24px)]">
        {children}
      </div>
      <p className="text-ink-muted mt-2 text-[14px] lg:hidden">
        Wide by design - scroll it sideways, or open it on a larger screen.
      </p>
    </figure>
  );
}
