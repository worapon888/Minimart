import { Product } from "@/types/product";

export type CartItem = Product & { quantity: number };

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "INCREASE_QUANTITY"; payload: number }
  | { type: "DECREASE_QUANTITY"; payload: number }
  | { type: "SET_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" };
