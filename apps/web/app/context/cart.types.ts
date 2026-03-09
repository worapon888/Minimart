import type { Product } from "../../../../packages/shared/types/product";

export type CartItem = Product & { quantity: number };

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string | number } // แก้ตรงนี้
  | { type: "INCREASE_QUANTITY"; payload: string | number } // แก้ตรงนี้
  | { type: "DECREASE_QUANTITY"; payload: string | number } // แก้ตรงนี้
  | { type: "SET_QUANTITY"; payload: { id: string | number; quantity: number } } // แก้ตรงนี้
  | { type: "CLEAR_CART" };
