"use client";

import { SegmentedControl } from "@/components/ui/controls";
import type { HarbourState } from "@/hooks/use-harbour-state";

/** As found, or fixed: the one switch every journey and defect page shares. */
export function StateSwitch({
  value,
  onChange,
  fixedLabel = "Fixed",
}: {
  value: HarbourState;
  onChange: (next: HarbourState) => void;
  fixedLabel?: string;
}) {
  return (
    <SegmentedControl<HarbourState>
      label="Show Harbour"
      value={value}
      onChange={onChange}
      options={[
        { value: "found", label: "As found" },
        { value: "fixed", label: fixedLabel },
      ]}
    />
  );
}
