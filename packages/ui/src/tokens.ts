/**
 * Khalifa Foods · Design tokens
 * Palette rooted in receipt paper + burnt saffron.
 * Every color has a purpose; no unlabeled neutrals.
 */

export const tokens = {
  color: {
    // Light theme
    ground:      "#F7F2E9",
    paper:       "#FFFEFB",
    ink:         "#141210",
    "ink-2":     "#3A342D",
    "ink-3":     "#6B6157",
    "ink-4":     "#A79E92",
    rule:        "#E4DBC9",
    "rule-2":    "#EFE7D6",

    accent:      "#C2410C",  // burnt saffron
    "accent-ink":"#7A2A08",
    "accent-wash":"#FBE9DB",

    // Semantic
    ok:          "#15803D",
    warn:        "#B45309",
    stop:        "#A81919",

    // Dark theme
    "d-ground":  "#141210",
    "d-paper":   "#1B1815",
    "d-ink":     "#F5EFE2",
    "d-ink-2":   "#D9CFBB",
    "d-ink-3":   "#A79E92",
    "d-ink-4":   "#6B6157",
    "d-rule":    "#2B2621",
    "d-rule-2":  "#221E1A",
    "d-accent":  "#E8813F",
    "d-accent-ink": "#F6BE93",
    "d-accent-wash":"#2E1C10",
    "d-ok":      "#4ADE80",
    "d-warn":    "#FCD34D",
    "d-stop":    "#F87171",
  },
  font: {
    serif:  '"Fraunces", "Iowan Old Style", "Palatino", ui-serif, Georgia, serif',
    sans:   '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    mono:   '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
    urdu:   '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif',
  },
  size: {
    "xs":  "0.72rem",
    "sm":  "0.82rem",
    "base":"0.95rem",
    "md":  "1.05rem",
    "lg":  "1.25rem",
    "xl":  "1.5rem",
    "2xl": "2rem",
    "3xl": "2.75rem",
    "4xl": "3.75rem",
    "5xl": "5rem",
  },
  radius: {
    sm: "3px",
    md: "6px",
    lg: "12px",
    xl: "20px",
    pill: "999px",
  },
  shadow: {
    sm: "0 1px 0 rgba(20,18,16,.04)",
    md: "0 1px 0 rgba(20,18,16,.04), 0 8px 20px -12px rgba(20,18,16,.18)",
    lg: "0 4px 24px -12px rgba(20,18,16,.24)",
  },
  space: {
    "1":".25rem", "2":".5rem", "3":".75rem", "4":"1rem", "5":"1.25rem",
    "6":"1.5rem", "8":"2rem", "10":"2.5rem", "12":"3rem", "16":"4rem",
    "20":"5rem", "24":"6rem",
  },
} as const;

export type Tokens = typeof tokens;
