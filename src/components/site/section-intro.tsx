import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionIntro({
  title,
  lead,
  align = "center",
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 max-w-[680px]",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <h2 className="text-gl-text text-[36px] leading-[1.08] font-bold tracking-[-0.025em] text-balance sm:text-[44px] sm:tracking-[-0.028em]">
        {title}
      </h2>
      {lead && (
        <p className="text-gl-text-muted mt-4 text-[17px] leading-[1.55] text-pretty">
          {lead}
        </p>
      )}
    </div>
  );
}
