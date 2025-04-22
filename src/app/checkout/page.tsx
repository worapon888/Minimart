"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CiCircleRemove } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa";

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    tel: "",
    address: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    tel: "",
    address: "",
  });

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // อัปเดตค่าฟอร์ม
    setForm((prev) => ({ ...prev, [name]: value }));

    // เคลียร์ error เฉพาะช่องที่กำลังกรอก
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheckout = () => {
    let hasError = false;
    const newErrors = { name: "", tel: "", address: "" };

    if (!form.name.trim()) {
      newErrors.name = "Please enter your name.";
      hasError = true;
    }
    if (!/^[0-9]{9,10}$/.test(form.tel)) {
      newErrors.tel = "Phone number must be 9–10 digits.";
      hasError = true;
    }
    if (!form.address.trim()) {
      newErrors.address = "Please enter your address.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    // ✅ เริ่มโหลด
    setIsLoading(true);

    // จำลอง delay (ถ้าไม่มี backend จริง)
    setTimeout(() => {
      dispatch({ type: "CLEAR_CART" });
      router.push("/order-success");
    }, 1500);
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
      <div className="max-w-6xl mx-auto px-4 py-8 bg-white rounded-lg">
        {/* Product table */}
        <div className="w-full mb-10">
          <div className="hidden md:grid grid-cols-4 font-semibold border-b border-[#E5E5E5] pb-3">
            <span className="pl-16">Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-center">Subtotal</span>
          </div>

          {state.items.map((item) => (
            <div
              key={item.id}
              className="md:grid md:grid-cols-4 border-b border-[#E5E5E5] py-4 text-sm flex flex-col gap-4"
            >
              {/* Product Column */}
              <div className="relative flex items-start gap-4 pl-2 md:pl-10">
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_ITEM", payload: item.id })
                  }
                  className="absolute -left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 md:relative md:top-auto md:translate-y-0"
                  title="Remove item"
                >
                  <CiCircleRemove className="text-2xl cursor-pointer" />
                </button>

                <Image
                  src={item.image}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="rounded"
                />

                <div className="flex flex-col">
                  <span className="font-medium leading-snug">{item.title}</span>
                </div>
              </div>

              <div className="text-center md:text-center">
                <span className="block md:hidden text-gray-500">Price</span>$
                {item.price.toFixed(2)}
              </div>

              <div className="text-center md:text-center">
                <span className="block md:hidden text-gray-500">Qty</span>
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

              <div className="text-center md:text-center">
                <span className="block md:hidden text-gray-500">Subtotal</span>$
                {(item.price * item.quantity).toFixed(2)}
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
            <div className="space-y-6">
              {/* Name Field */}
              <div className="relative">
                <input
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleInput}
                  className={`w-full border rounded px-4 py-2 ${
                    errors.name
                      ? "border-red-500 border-2"
                      : "border-gray-300 border-2"
                  }`}
                />
                {errors.name && (
                  <div className="absolute -top-7 left-2  bg-amber-300 text-red-500 font-medium text-xs rounded px-2 py-1 shadow z-10 animate-fade-in">
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Tel Field */}
              <div className="relative">
                <input
                  name="tel"
                  placeholder="Tel"
                  value={form.tel}
                  onChange={handleInput}
                  className={`w-full border rounded px-4 py-2 ${
                    errors.tel
                      ? "border-red-500 border-2"
                      : "border-gray-300 border-2"
                  }`}
                />
                {errors.tel && (
                  <div className="absolute -top-7 left-2 bg-amber-300 text-red-500 font-medium text-xs rounded px-2 py-1 shadow z-10 animate-fade-in">
                    {errors.tel}
                  </div>
                )}
              </div>

              {/* Address Field */}
              <div className="relative">
                <textarea
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  onChange={handleInput}
                  rows={4}
                  className={`w-full border rounded px-4 py-2 ${
                    errors.address
                      ? "border-red-500 border-2"
                      : "border-gray-300 border-2"
                  }`}
                />
                {errors.address && (
                  <div className="absolute -top-7 left-2  bg-amber-300 text-red-500 font-medium text-xs rounded px-2 py-1 shadow z-10 animate-fade-in">
                    {errors.address}
                  </div>
                )}
              </div>
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
              disabled={isLoading}
              className={`w-full bg-[#2F2F2F] text-white py-2 rounded-2xl hover:opacity-90 transition cursor-pointer ${
                isLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Processing...
                </div>
              ) : (
                "Checkout"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
