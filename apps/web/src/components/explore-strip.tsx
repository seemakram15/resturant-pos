"use client";

import Link from "next/link";
import { useRef } from "react";

export function ExploreStrip({
  items,
}: {
  items: Array<{ slug: string; href: string; img: string; label: string; sub: string }>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function nudge(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  }

  return (
    <div className="explore-row">
      <button className="explore-arrow" aria-label="Scroll left" onClick={() => nudge(-1)}>‹</button>
      <div className="explore-strip" ref={trackRef}>
        {items.map((it) => (
          <Link key={it.slug} href={it.href} className="explore-card">
            <span className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.img} alt={it.label} loading="lazy" />
            </span>
            <span className="label">
              {it.label}
              <small>{it.sub}</small>
            </span>
          </Link>
        ))}
      </div>
      <button className="explore-arrow" aria-label="Scroll right" onClick={() => nudge(1)}>›</button>
    </div>
  );
}
