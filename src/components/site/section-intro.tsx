import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionIntro({
  title,
  lead,
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("mb-10", className)}>
      <h2 className="dd-head text-ink text-[32px] sm:text-[40px]">{title}</h2>
      {lead && (
        <p className="text-ink-body mt-4 max-w-[56ch] text-[18px] leading-[1.55] text-pretty">
          {lead}
        </p>
      )}
    </div>
  );
}
