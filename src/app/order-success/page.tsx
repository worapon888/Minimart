"use client";

import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function OrderSuccessPage() {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-[#f9f9f9] px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800">
        Order Confirmation
      </h1>

      <p className="text-base sm:text-lg text-gray-600 max-w-md">
        Your order has been confirmed. A receipt has been sent to your email.
      </p>

      {/* Icon */}
      <div className="text-6xl sm:text-7xl text-green-600">✓</div>

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Thank you
      </h2>

      {/* Continue Shopping Button */}
      <Link
        href="/products"
        className="inline-block bg-black text-white px-6 py-3 rounded-full text-sm sm:text-base hover:opacity-90 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
