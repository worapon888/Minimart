"use client";

import Image from "next/image";
import { HeroImage } from "../../data";
import Link from "next/link";
import LogoTicker from "@/components/LogoTicker";
import FeaturesProducts from "@/components/FeaturesProducts";
import CategoriesProducts from "@/components/CategoreisProducts";
import WhyMinimalMart from "@/components/WhyMinimalMart";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);

  const sneakerRef = useRef<HTMLDivElement | null>(null);
  const sneakerTextRef = useRef<HTMLDivElement | null>(null);
  const watchRef = useRef<HTMLDivElement | null>(null);
  const watchTextRef = useRef<HTMLDivElement | null>(null);
  const guyRef = useRef<HTMLDivElement | null>(null);
  const guyTextRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subTextRef = useRef<HTMLParagraphElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const targets = [
        sneakerRef.current,
        sneakerTextRef.current,
        watchRef.current,
        watchTextRef.current,
        guyRef.current,
        guyTextRef.current,
        headingRef.current,
        subTextRef.current,
        buttonRef.current,
      ].filter(Boolean);

      // เริ่มต้นซ่อนไว้ (fade-in)
      gsap.set(targets, { opacity: 0, y: 14 });

      // fade-in ธรรมดา + stagger นิดหน่อย
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.15,
        clearProps: "transform", // ไม่ทิ้ง transform ค้าง
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="w-full py-10 container">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-14 px-6">
        <div className="grid grid-cols-[1fr_1.2fr] grid-rows-2 gap-5 w-full max-w-5xl">
          <div
            ref={sneakerRef}
            className="relative col-span-1 row-span-2 rounded-2xl overflow-hidden aspect-[3/6] w-full"
          >
            <Image
              src={HeroImage[0].img}
              alt={HeroImage[0].alt}
              fill
              className="object-cover"
              priority
            />

            <div
              ref={sneakerTextRef}
              className="absolute top-3 left-3 px-3 py-2 text-sm leading-snug"
            >
              <p className="block text-[18px] sm:text-[22px] md:text-[24px] lg:text-[28px] xl:text-[34px] font-normal text-white">
                Live
              </p>

              <span className="block text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[24px] font-normal text-white">
                less,
              </span>

              <span className="block text-white text-[12px] sm:text-[13px] md:text-[14px] mt-1">
                feel more.
              </span>
            </div>
          </div>

          <div
            ref={watchRef}
            className="relative rounded-2xl overflow-hidden aspect-[5/4] w-full"
          >
            <Image
              src={HeroImage[1].img}
              alt={HeroImage[1].alt}
              fill
              className="object-cover"
            />

            <div
              ref={watchTextRef}
              className="absolute top-3 left-3 text-white text-sm px-3 py-2"
            >
              <span className="font-normal">
                <span className="hidden lg:block text-[18px] xl:text-[20px] leading-[1.4]">
                  Curated essentials
                </span>

                <span className="block text-[12px] sm:text-[13px] md:text-[14px] mt-1 opacity-80">
                  for a simpler life.
                </span>
              </span>
            </div>
          </div>

          <div
            ref={guyRef}
            className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full"
          >
            <Image
              src={HeroImage[2].img}
              alt={HeroImage[2].alt}
              fill
              className="object-cover"
            />

            <div
              ref={guyTextRef}
              className="absolute bottom-3 right-3 text-white text-right px-3 py-2"
            >
              <span className="font-normal leading-snug text-[12px] md:text-[14px] lg:text-[18px] xl:text-[24px]">
                Minimal goods for maximal living.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center flex-col md:text-left w-full max-w-md space-y-6">
          <h2
            ref={headingRef}
            className="text-2xl md:text-4xl font-light text-gray-600 text-center tracking-tight"
          >
            Simplify{" "}
            <span className="font-normal text-gray-900">your lifestyle.</span>
          </h2>

          <p
            ref={subTextRef}
            className="text-base md:text-lg font-light text-gray-500 text-center tracking-wide"
          >
            Minimal goods for maximal living
          </p>
          <div ref={buttonRef} className="relative inline-block">
            <Link href="/products">
              <button
                className="
        inline-flex items-center gap-2
        px-6 py-3
        rounded-full
        border border-gray-300
        text-gray-800
        bg-white
        hover:bg-gray-100
        transition-all duration-200 cursor-pointer
      "
              >
                <span>→</span> Shop Now
              </button>
            </Link>
          </div>
        </div>
      </div>

      <LogoTicker />
      <FeaturesProducts />
      <CategoriesProducts />
      <WhyMinimalMart />
    </section>
  );
}
