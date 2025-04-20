"use client";

import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function OrderSuccessPage() {
  useEffect(() => {
    // ปล่อย confetti เมื่อโหลดหน้า
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-[#f9f9f9] px-4">
      <h1 className="text-4xl font-semibold mb-2 text-gray-800">
        Order Confirmation
      </h1>
      <p className="text-gray-600 mb-8">
        Your order has been confirmed. A receipt has been sent to your email
      </p>

      {/* Icon */}
      <div className="text-5xl text-green-600 mb-6">✓</div>

      <h2 className="text-3xl font-bold mb-4 text-gray-900">Thank you</h2>

      {/* Continue Shopping Button */}
      <Link
        href="/products"
        className="inline-block bg-black text-white px-6 py-3 rounded-full hover:opacity-90 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
