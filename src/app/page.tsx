"use client";

import Image from "next/image";
import { HeroImage } from "../../data";
import Link from "next/link";
import LogoTicker from "@/components/LogoTicker";

export default function Hero() {
  return (
    <section className="w-full py-10 container">
      <div className=" max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16 px-6">
        {/* Section A: Image Grid */}
        <div className="grid grid-cols-[1fr_1.2fr] grid-rows-2 gap-6 w-full max-w-5xl">
          {/* Sneaker - ซ้าย สูงเท่ากับภาพขวาบน + ล่าง */}
          <div className="relative col-span-1 row-span-2 rounded-xl overflow-hidden aspect-[3/6] w-full">
            <Image
              src={HeroImage[0].img}
              alt={HeroImage[0].alt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-1 left-1 px-4 py-2 font-semibold text-xl leading-tight stroke-layer">
              <span className="block text-5xl font-normal stroke-layer">
                Live{" "}
                <span className="relative font-normal text-black text-[32px] z-0 leading-none stroke-layer">
                  <span className="absolute top-0 left-0 text-white z-[-1] stroke-layer">
                    less,
                  </span>
                  less,
                </span>
              </span>
              <span className="block text-gray-600 font-normal">
                feel more.
              </span>
            </div>
          </div>

          {/* Watch */}
          <div className="relative rounded-xl overflow-hidden aspect-[5/4] w-full">
            <Image
              src={HeroImage[1].img}
              alt={HeroImage[1].alt}
              fill
              className="object-cover"
            />
            <div className="absolute top-3 left-3 text-white text-sm font-medium px-3 py-2 rounded-md ">
              <span className="stroke-layer2 text-xl font-normal">
                <span className="text-3xl ">Curated essentials</span> <br /> for
                a simpler life.
              </span>
            </div>
          </div>

          {/* Guy */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/3] w-full">
            <Image
              src={HeroImage[2].img}
              alt={HeroImage[2].alt}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-1 right-1 text-black text-sm font-medium text-right px-3 py-2 rounded-md backdrop-blur-sm">
              <span className="stroke-layer3 text-3xl font-normal ">
                Minimal goods <br /> for maximal <br /> living.
              </span>
            </div>
          </div>
        </div>

        {/* Section B: Text + CTA */}
        <div className="flex items-center justify-center flex-col md:text-left w-full max-w-md space-y-8">
          <h2 className="text-3xl text-center md:text-5xl font-light italic text-gray-700">
            Simplify{" "}
            <span className="not-italic font-medium text-black">
              your lifestyle.
            </span>
          </h2>
          <p className="text-3xl font-normal text-center">
            Minimal goods for maximal living
          </p>
          <Link href="/products">
            <button className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-[#252525] text-white rounded-full hover:bg-gray-800 transition">
              <span>→</span> Shop Now
            </button>
          </Link>
        </div>
      </div>
      <LogoTicker />
    </section>
  );
}
