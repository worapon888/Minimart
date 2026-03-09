// packages/shared/utils/price.ts
import type { Product } from "../types/product";

type AnyRecord = Record<string, unknown>;

export const toNum = (v: unknown): number | null => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof v === "bigint") return Number(v);
  return null;
};

export const getPriceUSD = (p: Product | unknown): number | null => {
  if (typeof p !== "object" || p === null) return null;
  const obj = p as AnyRecord;

  // รองรับหลายชื่อ field ที่ backend อาจส่งมา
  const cents =
    toNum(obj.priceCents) ?? toNum(obj.price_cents) ?? toNum(obj.priceInCents);

  if (cents !== null) return cents / 100;

  const price = toNum(obj.price);
  if (price !== null) return price;

  return null;
};

// optional helper เอาไปใช้ render
export const formatUSD = (value: number | null): string =>
  value === null ? "—" : `$${value.toFixed(2)}`;
