"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";

/** Scroll reveal: 24px lift and fade, once. Stagger bodies by ~130ms. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0px)" : "translateY(24px)",
        transition: `opacity 560ms ease-out ${delay}ms, transform 560ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
