"use client";

import { FaPlus } from "react-icons/fa";
import Image from "next/image";
import type { FeaturedProduct, Product } from "@/types/product";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function FeaturesProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data: Product[] = await res.json();

        const featured: FeaturedProduct[] = data.slice(0, 4).map((item) => {
          const raw =
            item.thumbnail?.trim() ||
            (Array.isArray(item.images) ? item.images[0]?.trim() : "") ||
            "";

          const image = raw ? raw : null;
          const tag = item.tags?.[0];

          return {
            id: item.id,
            title: item.title,
            price: item.price,
            image,
            category: item.category,
            tag,
          };
        });

        if (mounted) setProducts(featured);
      } catch {
        if (mounted) setProducts([]);
      }
    })();

    return () => {
      mounted = false;
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
    <section className="py-10 px-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Progress Bar */}
        <div className="w-full lg:flex-1 h-[3px] bg-neutral-200 relative rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="absolute inset-y-0 left-0 w-[45%]
                       bg-gradient-to-r from-transparent via-neutral-900/25 to-transparent"
          />
        </div>

        {/* Header Text + Button */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] sm:text-[14px] font-normal tracking-[0.18em] text-neutral-700 uppercase">
            Featured Products
          </span>

          <button
            type="button"
            aria-label="Add"
            className="w-10 h-10 flex items-center justify-center rounded-full
                       bg-neutral-100 text-neutral-700 border border-neutral-200
                       hover:bg-neutral-200/60 transition"
          >
            <FaPlus className="text-[14px]" />
          </button>
        </div>
      </div>

      <h2 className="text-[20px] sm:text-[22px] font-normal text-neutral-900 mt-8 mb-6 tracking-tight">
        <span className="text-neutral-500">Top picks,</span> curated for you.
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {products.map((product, index) => {
          let spanClass = "";

          if (index === 0) spanClass = "lg:col-span-2 lg:row-span-1";
          else if (index === 1)
            spanClass = "lg:col-span-2 lg:row-start-2 lg:row-span-1";
          else if (index === 2) spanClass = "lg:col-start-3 lg:row-span-2";
          else if (index === 3) spanClass = "lg:col-start-4 lg:row-span-2";

          const isTall = index === 2 || index === 3;

          const ImageBlock = (
            <div
              className={[
                "relative bg-neutral-50",
                isTall ? "h-[520px] lg:h-[700px]" : "h-[280px] sm:h-[360px]",
              ].join(" ")}
            >
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes={
                    isTall
                      ? "(max-width: 1024px) 100vw, 33vw"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  }
                  className={[
                    "object-contain transition duration-300 group-hover:scale-[1.02]",
                    isTall ? "p-10" : "p-8",
                  ].join(" ")}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-neutral-400 text-sm">
                  No image
                </div>
              )}
            </div>
          );

          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className={[
                "group rounded-2xl overflow-hidden",
                "bg-white border border-neutral-200/70",
                "shadow-[0_1px_0_rgba(0,0,0,0.03)]",
                "transition duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
                spanClass,
              ].join(" ")}
            >
              <div className="relative">
                {ImageBlock}

                {/* tag */}
                {product.tag && (
                  <span
                    className="absolute top-3 right-3 rounded-full
                               bg-white/85 backdrop-blur px-3 py-1
                               text-[11px] font-normal tracking-[0.14em] uppercase
                               text-neutral-700 border border-neutral-200"
                  >
                    {product.tag}
                  </span>
                )}
              </div>

              {/* content */}
              <div className="p-4 sm:p-5">
                <p className="text-[13px] sm:text-[14px] font-normal text-neutral-900 tracking-tight truncate">
                  {product.title}
                </p>
                <p className="mt-1 text-[13px] sm:text-[14px] text-neutral-500">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
