import type { ReactNode } from "react";
import type { Hue } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { ExpandDrawing } from "./expand-drawing";
import { FitText } from "./fit-text";
import { Swatch } from "./swatch";

const ORDER: Hue[] = ["plum", "teal", "green", "amber"];

/**
 * A course drawing in a hairline frame, its key and caption beneath. The key
 * names only the hues the drawing uses, in the course's own words; `labels`
 * overrides them for a drawing that means something else by a hue.
 */
export function Figure({
  drawing,
  children,
  hues = [],
  legend,
  labels,
  wide,
}: {
  drawing: ReactNode;
  children?: ReactNode;
  hues?: Hue[];
  legend: Partial<Record<Hue, string>>;
  labels?: Partial<Record<Hue, string>>;
  wide?: boolean;
}) {
  // Only hues the course legend or the figure itself names; an unnamed hue is
  // explained by the labels inside the drawing.
  const key = ORDER.filter((h) => hues.includes(h)).flatMap((h) => {
    const label = labels?.[h] ?? legend[h];
    return label ? [{ hue: h, label }] : [];
  });
  return (
    <figure
      data-pagefind-ignore
      className={cn("not-prose my-10", !wide && "max-w-[760px]")}
    >
      <div className="dd-fig border-rule bg-ground overflow-x-auto rounded-[2px] border p-4 sm:p-5">
        {drawing}
      </div>
      <FitText />
      <ExpandDrawing />
      {(key.length > 0 || children) && (
        <figcaption className="mt-3 space-y-2">
          {key.length > 0 && (
            <ul className="text-ink-muted flex flex-wrap gap-x-5 gap-y-1.5 text-[14px]">
              {key.map(({ hue, label }) => (
                <li key={hue} className="inline-flex items-center gap-2">
                  <Swatch hue={hue} />
                  {label}
                </li>
              ))}
            </ul>
          )}
          {children && (
            <div className="text-ink-muted max-w-[72ch] text-[15px] leading-[1.55] text-pretty [&_code]:font-mono [&_code]:text-[0.9em] [&>p]:m-0">
              {children}
            </div>
          )}
        </figcaption>
      )}
      <p className="text-ink-muted mt-2 text-[14px] md:hidden">
        Wide by design - scroll it sideways.
      </p>
    </figure>
  );
}
