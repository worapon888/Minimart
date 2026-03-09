"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { cartReducer } from "./cart.reducer";
import type { CartState, CartAction, CartItem } from "./cart.types";

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

/**
 * แปลงค่าให้เป็น ID ที่รองรับทั้ง string และ number
 * เนื่องจาก database ของคุณใช้ cuid (string) แต่บางส่วนอาจมี number
 */
const toSafeId = (v: unknown): string | number | null => {
  if (typeof v === "string" && v.trim() !== "") return v;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
};

const toNumber = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;

        if (Array.isArray(parsed)) {
          // ล้างตะกร้าเริ่มต้นก่อนโหลดค่าจาก Storage
          dispatch({ type: "CLEAR_CART" });

          parsed.forEach((raw) => {
            if (typeof raw !== "object" || raw === null) return;

            const obj = raw as Record<string, unknown>;

            // ✅ เปลี่ยนมาใช้ toSafeId เพื่อรองรับ ID แบบ string (CUID)
            const id = toSafeId(obj.id);
            if (id === null) return;

            // ✅ rebuild ให้เป็น CartItem โดยไม่บังคับ id เป็น number
            const item: CartItem = {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(obj as any), // ใช้ any เพื่อเลี่ยงการติด type constraint ชั่วคราวตอน spread
              id,
              quantity: toNumber(obj.quantity) ?? 1,
            };

            dispatch({ type: "ADD_ITEM", payload: item });
          });
        }
      } catch (e) {
        console.error("Invalid cart data in localStorage", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // 2. Sync state to localStorage only after hydration
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items, isHydrated]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {/* ป้องกันปัญหาน้ำท่วม (Hydration Mismatch) 
        โดยการรอให้โหลดข้อมูลจาก LocalStorage เสร็จก่อนเรนเดอร์ Children
      */}
      {isHydrated ? children : <div className="invisible">{children}</div>}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
