"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A YouTube-style top progress bar. Kicks off the moment a same-origin link is
 * clicked (or a form is submitted) and completes when Next has painted the new
 * route. Eliminates the "did my click work?" feeling.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastKey = useRef<string>(`${pathname}?${search?.toString() ?? ""}`);

  function start() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setVisible(true);
    setProgress(8);
    // Trickle up to ~85% while waiting
    let p = 8;
    const tick = () => {
      p += Math.max(0.4, (85 - p) * 0.04);
      setProgress(Math.min(p, 85));
      if (p < 85) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function finish() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(100);
    timerRef.current = setTimeout(() => { setVisible(false); setProgress(0); }, 240);
  }

  // Route change => finish
  useEffect(() => {
    const key = `${pathname}?${search?.toString() ?? ""}`;
    if (key !== lastKey.current) { lastKey.current = key; finish(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  // Detect clicks on same-origin links + form submits and start immediately
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null;
      if (!el) return;
      if (el.target === "_blank" || el.hasAttribute("download")) return;
      const href = el.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const u = new URL(el.href, location.href);
        if (u.origin !== location.origin) return;
        if (u.pathname === location.pathname && u.search === location.search) return;
        start();
      } catch { /* ignore */ }
    }
    function onSubmit() { start(); }
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="route-progress"
      role="progressbar"
      aria-hidden={!visible}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={visible ? Math.round(progress) : 0}
      style={{
        opacity: visible ? 1 : 0,
        transform: `translate3d(-${100 - progress}%, 0, 0)`,
      }}
    />
  );
}
