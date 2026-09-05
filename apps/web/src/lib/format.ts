export function formatPKR(amount: number, opts?: { withSymbol?: boolean }) {
  const rounded = Math.round(amount);
  const withCommas = rounded.toLocaleString("en-PK");
  return opts?.withSymbol === false ? withCommas : `Rs ${withCommas}`;
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** ULID-lite: sortable, URL-safe id */
export function ulid(): string {
  const t = Date.now().toString(36).padStart(10, "0");
  const r = Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map((b) => b.toString(36))
    .join("")
    .slice(0, 16);
  return (t + r).toUpperCase();
}
