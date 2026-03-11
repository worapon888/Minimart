"use client";

import Image from "next/image";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import type { Product, ProductsResponse } from "../../../../packages/shared/types/product";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { CategoryCard } from "../lib/home-page-data";

/** ---------- type guards ---------- */
const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

const hasKey = <K extends string>(
  obj: Record<string, unknown>,
  key: K,
): obj is Record<K, unknown> => key in obj;

const isProductsResponse = (x: unknown): x is ProductsResponse => {
  if (!isObject(x)) return false;
  return hasKey(x, "data") && Array.isArray(x.data);
};

const isProduct = (x: unknown): x is Product => {
  if (!isObject(x)) return false;
  return (
    hasKey(x, "id") &&
    typeof x.id === "string" &&
    hasKey(x, "title") &&
    typeof x.title === "string"
  );
};

/** ---------- normalize /products -> Product[] ---------- */
const normalizeProducts = (json: unknown): Product[] => {
  if (Array.isArray(json)) return json.filter(isProduct);

  if (isProductsResponse(json)) return json.data.filter(isProduct);

  if (isObject(json)) {
    if (hasKey(json, "items") && Array.isArray(json.items))
      return json.items.filter(isProduct);

    if (hasKey(json, "products") && Array.isArray(json.products))
      return json.products.filter(isProduct);

    if (hasKey(json, "data") && Array.isArray(json.data))
      return json.data.filter(isProduct);
  }

  return [];
};

/** ---------- image helper ---------- */
const getImageSrc = (p: Product): string | null => {
  // รองรับ backend imageUrl
  if (isObject(p) && "imageUrl" in p) {
    const v = p.imageUrl;
    if (typeof v === "string" && v.trim()) return v;
  }

  if (typeof p.thumbnail === "string" && p.thumbnail.trim()) return p.thumbnail;

  if (Array.isArray(p.images)) {
    const first = p.images[0];
    if (typeof first === "string" && first.trim()) return first;
  }

  return null;
};

type CategoriesProductsProps = {
  initialCategories?: CategoryCard[];
};

export default function CategoriesProducts({
  initialCategories = [],
}: CategoriesProductsProps) {
  const [categories, setCategories] = useState<CategoryCard[]>(initialCategories);
  const progressRef = useRef<HTMLDivElement>(null);
  const hasInitialCategories = initialCategories.length > 0;

  useEffect(() => {
    if (hasInitialCategories) return;

    let alive = true;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/products`;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");

        const json: unknown = await res.json();
        const products = normalizeProducts(json);

        if (!alive) return;

        const map = new Map<string, string | null>();

        for (const p of products) {
          const key = typeof p.category === "string" ? p.category.trim() : "";
          if (!key || map.has(key)) continue;

          map.set(key, getImageSrc(p));
        }

        const list: CategoryCard[] = Array.from(map.entries()).map(
          ([category, image]) => ({ category, image }),
        );

        list.sort((a, b) => a.category.localeCompare(b.category));

        setCategories(list);
      } catch {
        if (!alive) return;
        setCategories([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [hasInitialCategories]);

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
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="w-full lg:flex-1 h-[3px] bg-neutral-200 relative rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="absolute inset-y-0 left-0 w-[45%]
                       bg-gradient-to-r from-transparent via-neutral-900/25 to-transparent"
          />
        </div>

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

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const href = `/products/${encodeURIComponent(
            cat.category.toLowerCase(),
          )}`;
          const imgSrc =
            typeof cat.image === "string" && cat.image.trim()
              ? cat.image
              : null;

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
