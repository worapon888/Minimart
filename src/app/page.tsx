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
  const sneakerRef = useRef(null);
  const sneakerTextRef = useRef(null);
  const watchRef = useRef(null);
  const watchTextRef = useRef(null);
  const guyRef = useRef(null);
  const guyTextRef = useRef(null);
  const headingRef = useRef(null);
  const subTextRef = useRef(null);
  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    const fullPopLoop = (target: gsap.TweenTarget, delay = 0) => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, delay });
      tl.set(target, { scale: 0 })
        .to(target, {
          scale: 1,
          duration: 1,
          ease: "power3.out",
        })
        .to(target, {
          scale: 1,
          duration: 2.5, // ค้างไว้นานขึ้นก่อนหายไป
          ease: "none",
        })
        .to(target, {
          scale: 0,
          duration: 1,
          ease: "power3.in",
        });
    };

    const fullPopOpacityLoop = (target: gsap.TweenTarget, delay = 0) => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, delay });
      tl.set(target, { scale: 0, opacity: 0 })
        .to(target, {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        })
        .to(target, {
          scale: 1,
          opacity: 1,
          duration: 2.5, // ค้างไว้นานขึ้นก่อนหายไป
          ease: "none",
        })
        .to(target, {
          scale: 0,
          opacity: 0,
          duration: 1,
          ease: "power3.in",
        });
    };

    fullPopLoop(sneakerRef.current, 0.2);
    fullPopOpacityLoop(sneakerTextRef.current, 1);
    fullPopLoop(watchRef.current, 1.2);
    fullPopOpacityLoop(watchTextRef.current, 1.5);
    fullPopLoop(guyRef.current, 1.8);
    fullPopOpacityLoop(guyTextRef.current, 2.1);

    gsap.fromTo(
      [headingRef.current, subTextRef.current, buttonRef.current],
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.3,
        duration: 1,
        ease: "power3.out",
        delay: 0.3,
      }
    );

    gsap.to(buttonRef.current, {
      scale: 1.03,
      repeat: -1,
      yoyo: true,
      duration: 1.8,
      ease: "power2.inOut",
    });
  }, []);

  return (
    <section className="w-full py-10 container">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16 px-6">
        <div className="grid grid-cols-[1fr_1.2fr] grid-rows-2 gap-6 w-full max-w-5xl">
          <div
            ref={sneakerRef}
            className="relative col-span-1 row-span-2 rounded-xl overflow-hidden aspect-[3/6] w-full"
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
              className="absolute top-2 left-1 px-3 sm:px-4 py-2 font-semibold text-base sm:text-lg md:text-xl leading-snug stroke-layer"
            >
              {/* บรรทัด 1: Live */}
              <p className="block text-[20px] sm:text-[24px] md:text-[26px] lg:text-[32px] xl:text-[40px] font-normal leading-tight tracking-tight">
                Live
              </p>

              {/* บรรทัด 2: less, ซ้อนสองชั้น */}
              <span className="relative block font-normal text-[14px] sm:text-[18px] md:text-[20px] lg:text-[24px] xl:text-[30px] leading-tight tracking-tight">
                <span className="absolute top-0 left-0 text-white z-0">
                  less,
                </span>
                <span className="relative z-10 text-black">less,</span>
              </span>

              {/* บรรทัด 3: feel more. */}
              <span className="block text-gray-600 font-medium text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] xl:text-[18px] mt-1">
                feel more.
              </span>
            </div>
          </div>

          <div
            ref={watchRef}
            className="relative rounded-xl overflow-hidden aspect-[5/4] w-full"
          >
            <Image
              src={HeroImage[1].img}
              alt={HeroImage[1].alt}
              fill
              className="object-cover"
            />
            <div
              ref={watchTextRef}
              className="absolute top-2 left-3 text-white text-sm font-medium px-3 py-2 rounded-md"
            >
              <span className="stroke-layer2 font-normal tracking-tight">
                <span className="block hidden lg:block text-[20px] xl:text-[22px] leading-[1.4]">
                  Curated essentials
                </span>

                <span className="block text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] mt-1 leading-[1.5]">
                  for a simpler life.
                </span>
              </span>
            </div>
          </div>

          <div
            ref={guyRef}
            className="relative rounded-xl overflow-hidden aspect-[4/3] w-full"
          >
            <Image
              src={HeroImage[2].img}
              alt={HeroImage[2].alt}
              fill
              className="object-cover"
            />
            <div
              ref={guyTextRef}
              className="absolute bottom-1 right-1 text-black text-sm font-medium text-right px-3 py-2  rounded-md"
            >
              <span className="stroke-layer3 font-normal leading-snug tracking-tight text-[12px]  md:text-[12px] lg:text-[20px] xl:text-[32px]">
                Minimal goods for maximal living.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center flex-col md:text-left w-full max-w-md space-y-8">
          <h2
            ref={headingRef}
            className="text-3xl text-center md:text-5xl font-light italic text-gray-700"
          >
            Simplify{" "}
            <span className="not-italic font-medium text-black">
              your lifestyle.
            </span>
          </h2>

          <p ref={subTextRef} className="text-3xl font-normal text-center">
            Minimal goods for maximal living
          </p>

          <div ref={buttonRef} className="relative inline-block">
            <Link href="/products">
              <button className="relative z-10 inline-flex cursor-pointer items-center gap-2 px-6 py-3 text-white rounded-full hover:opacity-90 transition overflow-hidden animate-gradient">
                <span>→</span> Shop Now
              </button>
            </Link>
            <div className="absolute inset-0 button-glow rounded-full pointer-events-none" />
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
