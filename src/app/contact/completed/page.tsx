"use client";

import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContactCompletedPage() {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <div className="relative">
      {/* 🎉 Confetti เต็มจอ */}
      {showConfetti && (
        <div className="fixed top-0 left-0 w-screen h-screen z-50 pointer-events-none">
          <Confetti
            width={width}
            height={height}
            numberOfPieces={300}
            recycle={false}
          />
        </div>
      )}

      {/* ✅ ส่วนหลักของหน้า */}
      <section className="max-w-xl mx-auto px-6 py-24 text-center space-y-8">
        <div className="text-5xl">✅</div>
        <h2 className="text-3xl font-semibold">Thank You!</h2>
        <p className="text-gray-600 text-lg">
          We’ve received your message and will get back to you as soon as
          possible.
        </p>

        <Link
          href="/"
          className="inline-block mt-6 px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition"
        >
          Back to Home
        </Link>
      </section>
    </div>
  );
}
