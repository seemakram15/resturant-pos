"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variant = "fade" | "up" | "down" | "left" | "right" | "zoom";

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  once = true,
  as: Tag = "div",
  className = "",
  style,
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  once?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setInView(true); return; }

    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once]);

  const Element = Tag as React.ElementType;
  return (
    <Element
      ref={ref as never}
      className={`reveal reveal--${variant} ${inView ? "in-view" : ""} ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Element>
  );
}
