"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CiCircleRemove } from "react-icons/ci";

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    tel: "",
    address: "",
  });

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = () => {
    if (!form.name || !form.tel || !form.address) {
      alert("Please fill in all shipping information.");
      return;
    }

    // Clear cart and redirect (mock)
    state.items.forEach((item) =>
      dispatch({ type: "REMOVE_ITEM", payload: item.id })
    );

    router.push("/order-success");
  };

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCost = 2.99;
  const total = subtotal + shippingCost;

  return (
    <>
      <h1 className="text-4xl font-semibold mb-8 text-center">Checkout</h1>
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg">
        {/* Product table */}
        <div className="w-full mb-10">
          <div className="grid grid-cols-4 font-semibold border-b border-[#E5E5E5]  pb-3">
            <span className="pl-16">Product</span>{" "}
            {/* << ขยับเฉพาะหัว product ให้ตรงกับเนื้อหา */}
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-center">Subtotal</span>
          </div>

          {state.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 items-center border-b border-[#E5E5E5] py-4 text-sm"
            >
              {/* Product Column */}
              <div className="relative flex items-start gap-4 pl-10">
                {/* ❌ Remove Button */}
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_ITEM", payload: item.id })
                  }
                  className="absolute -left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
                  title="Remove item"
                >
                  <CiCircleRemove className="text-2xl" />
                </button>

                {/* Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="rounded"
                />

                {/* Info (name + price) */}
                <div className="flex flex-col pl-10">
                  <span className="font-medium leading-snug">{item.title}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-center">${item.price.toFixed(2)}</div>

              {/* Quantity */}
              <div className="text-center">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_QUANTITY",
                      payload: {
                        id: item.id,
                        quantity: Number(e.target.value),
                      },
                    })
                  }
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Subtotal */}
              <div className="text-center">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Shipping address */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Shipping address
            </h2>
            <div className="space-y-4">
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleInput}
                className="w-full border rounded px-4 py-2"
              />
              <input
                name="tel"
                placeholder="Tel"
                value={form.tel}
                onChange={handleInput}
                className="w-full border rounded px-4 py-2"
              />
              <textarea
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleInput}
                className="w-full border rounded px-4 py-2"
                rows={4}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-3xl font-semibold ">Totals</h2>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <hr className="border-t border-[#E5E5E5]" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#2F2F2F] text-white py-2 rounded-2xl hover:opacity-90 cursor-pointer"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
