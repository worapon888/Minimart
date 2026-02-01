"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function OrderSuccessPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fade-top",
        { autoAlpha: 0, y: -10 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" },
      );

      if (iconRef.current) {
        gsap.fromTo(
          iconRef.current,
          { autoAlpha: 0, scale: 0.98, y: 6 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            delay: 0.1,
            ease: "power2.out",
          },
        );
      }

      gsap.fromTo(
        [".fade-up", buttonRef.current].filter(Boolean),
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          delay: 0.16,
          ease: "power2.out",
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="
        min-h-screen px-6 py-16
        flex items-center justify-center
      
      "
    >
      <section
        className="
          w-full max-w-md text-center
          rounded-3xl border border-black/10
          bg-white/70 backdrop-blur-xl
          px-6 py-10 sm:px-10 sm:py-12
        "
      >
        <p className="text-[11px] uppercase tracking-[0.24em] text-black/45 fade-top">
          Order status
        </p>

        <h1 className="mt-3 text-2xl sm:text-3xl font-normal tracking-tight text-black/85 fade-top">
          Order confirmed
        </h1>

        <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-black/55 fade-up">
          Your order has been confirmed. A receipt has been sent to your email.
        </p>

        <div
          ref={iconRef}
          className="
            mt-7 mx-auto
            grid place-items-center
            h-14 w-14 rounded-full
            border border-black/10
            bg-white/70
            text-black/70
          "
          aria-hidden="true"
        >
          ✓
        </div>

        <h2 className="mt-5 text-xl sm:text-2xl font-normal tracking-tight text-black/85 fade-up">
          Thank you
        </h2>

        <Link
          ref={buttonRef}
          href="/products"
          className="
            mt-7 inline-flex items-center justify-center
            w-full rounded-full
            bg-black text-white
            py-3 text-[12px] uppercase tracking-[0.22em]
            hover:bg-black/85 transition
          "
        >
          Continue shopping
        </Link>

        <Link
          href="/"
          className="
            mt-3 inline-flex items-center justify-center
            w-full rounded-full
            border border-black/10 bg-white/60
            py-3 text-[12px] uppercase tracking-[0.22em]
            text-black/60 hover:text-black/75 hover:bg-white transition
          "
        >
          Back to home
        </Link>
      </section>
    </div>
  );
}
