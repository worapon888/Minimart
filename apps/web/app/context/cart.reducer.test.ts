import { describe, expect, it } from "vitest";
import type { Product } from "../../../../packages/shared/types/product";
import { cartReducer } from "./cart.reducer";
import type { CartState } from "./cart.types";

function makeProduct(partial?: Partial<Product>): Product {
  return {
    id: partial?.id ?? "p1",
    title: partial?.title ?? "Product",
    description: partial?.description ?? "desc",
    category: partial?.category ?? "test",
    price: partial?.price ?? 10,
    discountPercentage: partial?.discountPercentage ?? 0,
    rating: partial?.rating ?? 0,
    stock: partial?.stock ?? 10,
    tags: partial?.tags ?? [],
    brand: partial?.brand ?? "brand",
    sku: partial?.sku ?? "SKU-1",
    weight: partial?.weight ?? 1,
    dimensions: partial?.dimensions ?? { width: 1, height: 1, depth: 1 },
    warrantyInformation: partial?.warrantyInformation ?? "n/a",
    shippingInformation: partial?.shippingInformation ?? "n/a",
    availabilityStatus: partial?.availabilityStatus ?? "in_stock",
    reviews: partial?.reviews ?? [],
    returnPolicy: partial?.returnPolicy ?? "n/a",
    minimumOrderQuantity: partial?.minimumOrderQuantity ?? 1,
    meta: partial?.meta ?? {
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      barcode: "1",
      qrCode: "1",
    },
    images: partial?.images ?? [],
    thumbnail: partial?.thumbnail ?? "/x.png",
  };
}

describe("cartReducer", () => {
  it("adds new item with quantity 1", () => {
    const state: CartState = { items: [] };
    const product = makeProduct();

    const next = cartReducer(state, { type: "ADD_ITEM", payload: product });

    expect(next.items).toHaveLength(1);
    expect(next.items[0].id).toBe(product.id);
    expect(next.items[0].quantity).toBe(1);
  });

  it("increments quantity when adding existing item", () => {
    const product = makeProduct();
    const state: CartState = { items: [{ ...product, quantity: 1 }] };

    const next = cartReducer(state, { type: "ADD_ITEM", payload: product });

    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(2);
  });

  it("removes item by id", () => {
    const p1 = makeProduct({ id: "p1" });
    const p2 = makeProduct({ id: "p2" });
    const state: CartState = {
      items: [
        { ...p1, quantity: 1 },
        { ...p2, quantity: 1 },
      ],
    };

    const next = cartReducer(state, { type: "REMOVE_ITEM", payload: "p1" });

    expect(next.items).toHaveLength(1);
    expect(next.items[0].id).toBe("p2");
  });

  it("increases and decreases quantity correctly", () => {
    const p1 = makeProduct({ id: "p1" });
    const state: CartState = { items: [{ ...p1, quantity: 2 }] };

    const inc = cartReducer(state, { type: "INCREASE_QUANTITY", payload: "p1" });
    expect(inc.items[0].quantity).toBe(3);

    const dec = cartReducer(inc, { type: "DECREASE_QUANTITY", payload: "p1" });
    expect(dec.items[0].quantity).toBe(2);
  });

  it("removes item when decreased to zero", () => {
    const p1 = makeProduct({ id: "p1" });
    const state: CartState = { items: [{ ...p1, quantity: 1 }] };

    const next = cartReducer(state, { type: "DECREASE_QUANTITY", payload: "p1" });

    expect(next.items).toHaveLength(0);
  });

  it("set quantity keeps min value at 1", () => {
    const p1 = makeProduct({ id: "p1" });
    const state: CartState = { items: [{ ...p1, quantity: 3 }] };

    const next = cartReducer(state, {
      type: "SET_QUANTITY",
      payload: { id: "p1", quantity: 0 },
    });

    expect(next.items[0].quantity).toBe(1);
  });

  it("clears cart", () => {
    const p1 = makeProduct({ id: "p1" });
    const state: CartState = { items: [{ ...p1, quantity: 2 }] };

    const next = cartReducer(state, { type: "CLEAR_CART" });

    expect(next.items).toEqual([]);
  });

  it("keeps state unchanged when action item id is not found", () => {
    const p1 = makeProduct({ id: "p1" });
    const state: CartState = { items: [{ ...p1, quantity: 2 }] };

    const removed = cartReducer(state, { type: "REMOVE_ITEM", payload: "p999" });
    expect(removed).toEqual(state);

    const inc = cartReducer(state, { type: "INCREASE_QUANTITY", payload: "p999" });
    expect(inc).toEqual(state);

    const dec = cartReducer(state, { type: "DECREASE_QUANTITY", payload: "p999" });
    expect(dec).toEqual(state);

    const set = cartReducer(state, {
      type: "SET_QUANTITY",
      payload: { id: "p999", quantity: 5 },
    });
    expect(set).toEqual(state);
  });

  it("returns current state for unknown action type", () => {
    const p1 = makeProduct({ id: "p1" });
    const state: CartState = { items: [{ ...p1, quantity: 2 }] };

    const next = cartReducer(
      state,
      { type: "UNKNOWN_ACTION" } as unknown as Parameters<typeof cartReducer>[1],
    );

    expect(next).toBe(state);
  });
});
