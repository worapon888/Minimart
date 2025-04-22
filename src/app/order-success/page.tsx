"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import gsap from "gsap";

export default function OrderSuccessPage() {
  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });

    const ctx = gsap.context(() => {
      gsap.from(".fade-top", {
        opacity: 0,
        y: -30,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(iconRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        ease: "back.out(1.7)",
      });

      gsap.from([".fade-up", buttonRef.current], {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.2,
        delay: 0.6,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col justify-center items-center text-center bg-[#f9f9f9] px-4 sm:px-6 py-12 space-y-6"
    >
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 fade-top">
        Order Confirmation
      </h1>

      <p className="text-base sm:text-lg text-gray-600 max-w-md fade-up">
        Your order has been confirmed. A receipt has been sent to your email.
      </p>

      <div ref={iconRef} className="text-6xl sm:text-7xl text-green-600">
        ✓
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 fade-up">
        Thank you
      </h2>

      <Link
        ref={buttonRef}
        href="/products"
        className="inline-block bg-black text-white px-6 py-3 rounded-full text-sm sm:text-base hover:opacity-90 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
