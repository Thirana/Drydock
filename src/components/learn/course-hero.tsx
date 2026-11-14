"use client";

import { useState, type ReactNode } from "react";
import { ScrollX } from "@/components/learn/scroll-x";
import { KadeAsFound } from "@/components/site/landing/request-drawing";
import { SegmentedControl } from "@/components/ui/controls";
import { withTransition } from "@/lib/view-transition";
import { FundamentalsRequest, KadeAtEnd } from "./course-drawings";

/** A course page's drawing: frameless, like the home page's, with one line under it. */
function Plate({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  caption: ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      <ScrollX className="dd-fig">{children}</ScrollX>
      <figcaption className="text-ink-muted mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-pretty">
        {caption}
      </figcaption>
    </figure>
  );
}

const GCP_VIEWS = {
  found: {
    label: "As found",
    caption:
      "Kadé’s project as chapter 0 finds it. The red marks are the five problems the course sets out to fix.",
  },
  end: {
    label: "At the end",
    caption:
      "Where the course leaves it: shoppers come in through Cloudflare, admins through IAP, and nothing in kade-vpc has an external IP.",
  },
} as const;

type GcpView = keyof typeof GCP_VIEWS;

export function CourseHero({
  course,
  className,
}: {
  course: string;
  className?: string;
}) {
  const [view, setView] = useState<GcpView>("found");

  if (course === "fundamentals") {
    return (
      <Plate
        className={className}
        caption="One request, from your laptop to kade-api. Each number is the part of the course that teaches that step."
      >
        <FundamentalsRequest />
      </Plate>
    );
  }
  if (course !== "gcp") return null;

  return (
    <div className={className}>
      <SegmentedControl
        label="Which state of Kadé’s project to show"
        options={(Object.keys(GCP_VIEWS) as GcpView[]).map((value) => ({
          value,
          label: GCP_VIEWS[value].label,
        }))}
        value={view}
        onChange={(v) => {
          if (v !== view) withTransition(() => setView(v), { kind: "map" });
        }}
      />
      <div style={{ viewTransitionName: "kade-map" }} className="mt-5">
        <Plate caption={GCP_VIEWS[view].caption}>
          {view === "found" ? <KadeAsFound /> : <KadeAtEnd />}
        </Plate>
      </div>
    </div>
  );
}
