import { CartState, CartAction } from "./cart.types";

export const cartReducer = (
  state: CartState,
  action: CartAction,
): CartState => {
  switch (action.type) {
    case "ADD_ITEM":
      const exist = state.items.find((item) => item.id === action.payload.id);
      if (exist) {
        return {
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      } else {
        return {
          items: [...state.items, { ...action.payload, quantity: 1 }],
        };
      }

    case "REMOVE_ITEM":
      return {
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "INCREASE_QUANTITY":
      return {
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };

    case "DECREASE_QUANTITY":
      return {
        items: state.items
          .map((item) =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };

    case "SET_QUANTITY":
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item,
        ),
      };

    case "CLEAR_CART":
      return { items: [] };

    default:
      return state;
  }
};
