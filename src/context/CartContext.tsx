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
import { CartState, CartAction, CartItem } from "./cart.types";

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        dispatch({ type: "CLEAR_CART" });
        parsed.forEach((item: CartItem) =>
          dispatch({ type: "ADD_ITEM", payload: item }),
        );
      } catch (e) {
        console.error("Invalid cart data in localStorage", e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items, isHydrated]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {isHydrated ? children : null}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
