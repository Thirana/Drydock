import { useEffect, useRef, useState } from "react";

// Fires once when the element is 80px inside the viewport, so the animation
// starts when the element is meaningfully visible, not barely peeking in.
export function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView] as const;
}
