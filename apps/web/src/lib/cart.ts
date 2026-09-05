"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  id: string;
  kind: "item" | "combo";
  refId: string;
  name_en: string;
  name_ur?: string | null;
  unitPrice: number;
  qty: number;
  notes?: string;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "id" | "qty"> & { qty?: number }) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (input) => {
        const key = `${input.kind}:${input.refId}`;
        set((s) => {
          const existing = s.lines.find((l) => `${l.kind}:${l.refId}` === key);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l === existing ? { ...l, qty: l.qty + (input.qty ?? 1) } : l
              ),
            };
          }
          return {
            lines: [
              ...s.lines,
              {
                id: crypto.randomUUID(),
                kind: input.kind,
                refId: input.refId,
                name_en: input.name_en,
                name_ur: input.name_ur,
                unitPrice: input.unitPrice,
                qty: input.qty ?? 1,
                notes: input.notes,
              },
            ],
          };
        });
      },
      setQty: (id, qty) =>
        set((s) => ({
          lines: qty <= 0
            ? s.lines.filter((l) => l.id !== id)
            : s.lines.map((l) => (l.id === id ? { ...l, qty } : l)),
        })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),
      count: () => get().lines.reduce((n, l) => n + l.qty, 0),
    }),
    { name: "khalifa.cart" }
  )
);
