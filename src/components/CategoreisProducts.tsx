"use client";

import Image from "next/image";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { Product } from "@/types/product";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

type CategoryCard = {
  category: string;
  image: string | null; // กัน empty string
};

export default function CategoriesProducts() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;

    fetch("/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (!alive) return;

        const map = new Map<string, string | null>();

        for (const p of data) {
          const key = String(p.category || "").trim();
          if (!key) continue;
          if (map.has(key)) continue;

          const img =
            (p.thumbnail && p.thumbnail.trim()) ||
            (Array.isArray(p.images) && p.images[0]) ||
            null;

          map.set(key, img);
        }

        const list: CategoryCard[] = Array.from(map.entries()).map(
          ([category, image]) => ({ category, image }),
        );

        // (optional) sort A-Z
        list.sort((a, b) => a.category.localeCompare(b.category));

        setCategories(list);
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!progressRef.current) return;

    gsap.set(progressRef.current, { xPercent: -120 });
    gsap.to(progressRef.current, {
      xPercent: 220,
      duration: 3.2,
      ease: "none",
      repeat: -1,
    });
  }, []);

  return (
    <section className="py-10 px-6 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Progress Bar */}
        <div className="w-full lg:flex-1 h-[3px] bg-neutral-200 relative rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="absolute inset-y-0 left-0 w-[45%]
                       bg-gradient-to-r from-transparent via-neutral-900/25 to-transparent"
          />
        </div>

        {/* Title + Button */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] sm:text-[14px] font-normal tracking-[0.18em] text-neutral-700 uppercase">
            Categories
          </span>

          <button
            aria-label="View all categories"
            className="w-10 h-10 flex items-center justify-center rounded-full
                       bg-neutral-100 text-neutral-700 border border-neutral-200
                       hover:bg-neutral-200/60 transition"
          >
            <FaPlus className="text-[14px]" />
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const href = `/products/${encodeURIComponent(cat.category.toLowerCase())}`;
          const imgSrc = cat.image?.trim() ? cat.image : null;

          return (
            <Link href={href} key={cat.category} className="group">
              <div
                className={[
                  "rounded-2xl overflow-hidden",
                  "bg-white border border-neutral-200/70",
                  "shadow-[0_1px_0_rgba(0,0,0,0.03)]",
                  "transition duration-300",
                  "hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
                ].join(" ")}
              >
                <div className="relative h-56 sm:h-72 bg-neutral-50">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={cat.category}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-contain p-10 transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-neutral-400 text-sm">
                      No image
                    </div>
                  )}

                  {/* Minimal label bar */}
                  <div className="absolute inset-x-0 bottom-0 px-4 py-4">
                    <div
                      className="mx-auto w-fit rounded-full bg-white/80 backdrop-blur
                                 border border-neutral-200 px-4 py-2"
                    >
                      <span className="text-[12px] sm:text-[13px] font-normal uppercase tracking-[0.18em] text-neutral-800">
                        {cat.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
