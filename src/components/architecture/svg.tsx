import type { SVGProps } from "react";
import { wrapText } from "@/lib/architecture/text-fit";

/** Props that make an SVG group behave like a button. */
export function selectable(
  label: string,
  onSelect?: () => void,
): SVGProps<SVGGElement> {
  if (!onSelect) return {};
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    style: { cursor: "pointer" },
    onClick: onSelect,
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    },
  };
}

/** Room a box keeps between its sub-line and its edges, in drawing units. */
const INSET = 24;

/**
 * A box's words, set where the course drawings set them: the title at 26
 * below the top, sub-lines 20 apart from 47, wrapped to the box's width.
 * A box with no sub-line centres its title.
 */
export function BoxText({
  x,
  y,
  w,
  h,
  title,
  sub,
  faint,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  /** Not built yet: the words recede with the dashed outline. */
  faint?: boolean;
}) {
  const lines = sub ? wrapText(sub, w - INSET, 13, "mono").lines : [];
  return (
    <>
      <text
        className={faint ? "t f" : "t"}
        x={x + 16}
        y={lines.length ? y + 26 : y + h / 2 + 5}
      >
        {title}
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          className={faint ? "s f" : "s"}
          x={x + 16}
          y={y + 47 + i * 20}
        >
          {line}
        </text>
      ))}
    </>
  );
}
