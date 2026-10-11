import type { ComponentType, ReactNode } from "react";
import type { IconName } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export interface IconProps {
  size?: number;
  className?: string;
}

// Custom stroke icons: stroke weight follows size (11–14 viewBox → 1.8–2,
// 22 → 1.6, delicate → 1.4). Colour always comes from currentColor.
function makeIcon(
  name: string,
  viewBox: number,
  strokeWidth: number,
  defaultSize: number,
  children: ReactNode,
) {
  function Icon({ size = defaultSize, className }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
        className={cn("shrink-0", className)}
      >
        {children}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}

export const IconArrow = makeIcon(
  "IconArrow",
  14,
  1.8,
  14,
  <path d="M3 7h8M7 3l4 4-4 4" />,
);
export const IconArrowRight = makeIcon(
  "IconArrowRight",
  12,
  1.8,
  12,
  <path d="M2.5 6H9M6 3l3 3-3 3" />,
);
export const IconArrowLeft = makeIcon(
  "IconArrowLeft",
  12,
  1.8,
  12,
  <path d="M9.5 6H3M6 3L3 6l3 3" />,
);
export const IconCheck = makeIcon(
  "IconCheck",
  14,
  2,
  14,
  <path d="M2.5 7.5l3 3 6-7" />,
);
export const IconX = makeIcon(
  "IconX",
  12,
  2,
  12,
  <path d="M3 3l6 6M9 3L3 9" />,
);
/** Two corners pulling outwards: open a drawing larger. */
export const IconExpand = makeIcon(
  "IconExpand",
  14,
  1.8,
  14,
  <path d="M8.5 2.5h3v3M11.5 2.5L8 6M5.5 11.5h-3v-3M2.5 11.5L6 8" />,
);
export const IconSearch = makeIcon(
  "IconSearch",
  16,
  1.8,
  16,
  <>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5l3.5 3.5" />
  </>,
);
export const IconMenu = makeIcon(
  "IconMenu",
  16,
  1.8,
  16,
  <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />,
);
export const IconChevronDown = makeIcon(
  "IconChevronDown",
  12,
  1.8,
  12,
  <path d="M3 4.5l3 3 3-3" />,
);
export const IconPlay = makeIcon(
  "IconPlay",
  12,
  1.8,
  12,
  <path d="M3.5 2.5v7l6-3.5-6-3.5z" />,
);
export const IconPause = makeIcon(
  "IconPause",
  12,
  2,
  12,
  <path d="M4 2.5v7M8 2.5v7" />,
);

export const IconBook = makeIcon(
  "IconBook",
  22,
  1.6,
  22,
  <>
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10v15H5.5A1.5 1.5 0 0 1 4 16.5v-12z" />
    <path d="M18 4.5A1.5 1.5 0 0 0 16.5 3H12v15h4.5A1.5 1.5 0 0 0 18 16.5v-12z" />
  </>,
);
export const IconMap = makeIcon(
  "IconMap",
  22,
  1.6,
  22,
  <>
    <path d="M3 5.5l5-2 6 2 5-2v13l-5 2-6-2-5 2v-13z" />
    <path d="M8 3.5v13M14 5.5v13" />
  </>,
);
export const IconGrid = makeIcon(
  "IconGrid",
  22,
  1.6,
  22,
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="12" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="12" width="7" height="7" rx="1.5" />
    <rect x="12" y="12" width="7" height="7" rx="1.5" />
  </>,
);
export const IconServer = makeIcon(
  "IconServer",
  22,
  1.6,
  22,
  <>
    <rect x="3" y="4" width="16" height="6" rx="1.5" />
    <rect x="3" y="12" width="16" height="6" rx="1.5" />
    <path d="M6.5 7h.01M6.5 15h.01" />
  </>,
);
export const IconLayers = makeIcon(
  "IconLayers",
  22,
  1.6,
  22,
  <>
    <path d="M11 3l8 4-8 4-8-4 8-4z" />
    <path d="M3 11l8 4 8-4M3 15l8 4 8-4" />
  </>,
);
export const IconRoute = makeIcon(
  "IconRoute",
  22,
  1.6,
  22,
  <>
    <circle cx="5" cy="17" r="2" />
    <circle cx="17" cy="5" r="2" />
    <path d="M7 17h7a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7" />
  </>,
);
export const IconAlert = makeIcon(
  "IconAlert",
  22,
  1.6,
  22,
  <>
    <path d="M11 3.5l8.5 15h-17L11 3.5z" />
    <path d="M11 9v4M11 15.8v.01" />
  </>,
);
export const IconList = makeIcon(
  "IconList",
  22,
  1.6,
  22,
  <path d="M3 5h16M3 11h16M3 17h16" />,
);

/** Icons addressable by name from content. */
/** Lamp on: the light-box theme. */
export const IconLamp = makeIcon(
  "IconLamp",
  16,
  1.6,
  16,
  <>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
  </>,
);
/** Lamp off: the bench in the dark. */
export const IconDark = makeIcon(
  "IconDark",
  16,
  1.6,
  16,
  <path d="M13 9.6A5.5 5.5 0 1 1 6.4 3a4.4 4.4 0 0 0 6.6 6.6z" />,
);

export const ICONS: Record<IconName, ComponentType<IconProps>> = {
  book: IconBook,
  map: IconMap,
  grid: IconGrid,
  server: IconServer,
  layers: IconLayers,
  route: IconRoute,
  alert: IconAlert,
};
