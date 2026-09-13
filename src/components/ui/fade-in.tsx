"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * - static: server render, or already on screen at mount. Never hidden, so the
 *   content stays readable if JavaScript is off or fails.
 * - waiting: below the fold at mount, hidden until it scrolls into view.
 * - shown: revealed.
 */
type Reveal = "static" | "waiting" | "shown";

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
  const ref = useRef<HTMLDivElement>(null);
  const [reveal, setReveal] = useState<Reveal>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let first = true;
    // Fires once the element is 80px inside the viewport, so the animation
    // starts when it is meaningfully visible, not barely peeking in.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const onScreen = entry.boundingClientRect.top < window.innerHeight;
        if (first && onScreen) {
          observer.disconnect();
        } else if (first) {
          setReveal("waiting");
        } else if (entry.isIntersecting) {
          setReveal("shown");
          observer.disconnect();
        }
        first = false;
      },
      { threshold: 0, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        reveal === "static"
          ? undefined
          : {
              opacity: reveal === "shown" ? 1 : 0,
              transform:
                reveal === "shown" ? "translateY(0px)" : "translateY(24px)",
              transition: `opacity 560ms ease-out ${delay}ms, transform 560ms ease-out ${delay}ms`,
            }
      }
    >
      {children}
    </div>
  );
}
