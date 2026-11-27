"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { SegmentedControl } from "@/components/ui/controls";
import { IconArrowRight } from "@/components/ui/icons";
import { withTransition } from "@/lib/view-transition";

export interface MapView {
  value: string;
  label: string;
  /** The course drawing, already in its frame with key and caption. */
  figure: ReactNode;
  source: { label: string; href: string };
}

/** Kadé's map at three points in the two courses, one drawing at a time. */
export function MapSwitch({ views }: { views: MapView[] }) {
  const [value, setValue] = useState(views[0].value);
  const view = views.find((v) => v.value === value) ?? views[0];

  return (
    <div className="max-w-[1004px]">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <SegmentedControl
          label="Which map of Kadé to show"
          options={views.map(({ value, label }) => ({ value, label }))}
          value={view.value}
          onChange={(v) => {
            if (v !== view.value)
              withTransition(() => setValue(v), { kind: "map" });
          }}
        />
        <Link
          href={view.source.href}
          className="dd-link inline-flex items-center gap-1.5 text-[15px]"
        >
          {view.source.label}
          <IconArrowRight size={12} />
        </Link>
      </div>
      <div
        key={view.value}
        style={{ viewTransitionName: "kade-map" }}
        className="dd-stage-in mt-5 [&>figure]:my-0"
      >
        {view.figure}
      </div>
    </div>
  );
}
