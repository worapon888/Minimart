"use client";

import { FaPlus } from "react-icons/fa";
import Image from "next/image";
import type {
  FeaturedProduct,
  Product,
  ProductsResponse,
} from "../../../../packages/shared/types/product";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { getPriceUSD } from "../../../../packages/shared/utils/price";

type FeaturedProductUI = FeaturedProduct & {
  hasPrice: boolean;
};

/** ---------- utils ---------- */
const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

const hasKey = <K extends string>(
  obj: Record<string, unknown>,
  key: K,
): obj is Record<K, unknown> => key in obj;

const isProductsResponse = (x: unknown): x is ProductsResponse => {
  if (!isObject(x)) return false;
  if (!hasKey(x, "data")) return false;
  return Array.isArray(x.data);
};

// ✅ ตรวจขั้นต่ำว่าเป็น Product (พอให้ปลอดภัยสำหรับ map)
const isProduct = (x: unknown): x is Product => {
  if (!isObject(x)) return false;
  return (
    hasKey(x, "id") &&
    typeof x.id === "string" &&
    hasKey(x, "title") &&
    typeof x.title === "string"
  );
};

// ✅ normalize /products -> Product[]
const normalizeProducts = (json: unknown): Product[] => {
  // 1) array ตรง ๆ
  if (Array.isArray(json)) return json.filter(isProduct);

  // 2) { ok, data: [...] }
  if (isProductsResponse(json)) return json.data.filter(isProduct);

  // 3) { items: [...] } / { products: [...] } / { data: [...] }
  if (isObject(json)) {
    const candidates: unknown[] = [];

    if (hasKey(json, "items") && Array.isArray(json.items))
      candidates.push(...json.items);
    else if (hasKey(json, "products") && Array.isArray(json.products))
      candidates.push(...json.products);
    else if (hasKey(json, "data") && Array.isArray(json.data))
      candidates.push(...json.data);

    return candidates.filter(isProduct);
  }

  return [];
};

// ✅ ดึงรูปแบบ type-safe (รองรับ thumbnail / images / imageUrl)
const getImageSrc = (p: Product): string | null => {
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

/** fetch helper: ได้ JSON จริง ๆ + แจ้ง error ชัด */
async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Response is not JSON: ${text.slice(0, 200)}`);
  }
}

export default function FeaturesProducts() {
  const [products, setProducts] = useState<FeaturedProductUI[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const url = `${API_BASE}/products`;
        const json = await fetchJSON<unknown>(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        const typed = normalizeProducts(json);

        const featured: FeaturedProductUI[] = typed.slice(0, 4).map((item) => {
          const image = getImageSrc(item);
          const tag =
            Array.isArray(item.tags) && item.tags.length > 0
              ? item.tags[0]
              : undefined;

          const parsed = getPriceUSD(item); // number | null
          const hasPrice = parsed !== null;

          return {
            id: item.id,
            title: item.title,
            price: hasPrice ? parsed : 0, // FeaturedProduct ต้องเป็น number
            image,
            category: item.category,
            tag,
            hasPrice,
          };
        });

        setProducts(featured);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("fetch featured products error:", err);
        setProducts([]);
      }
    })();

    return () => controller.abort();
  }, [API_BASE]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {products.map((product, index) => {
          let spanClass = "";
          if (index === 0) spanClass = "lg:col-span-2 lg:row-span-1";
          else if (index === 1)
            spanClass = "lg:col-span-2 lg:row-start-2 lg:row-span-1";
          else if (index === 2) spanClass = "lg:col-start-3 lg:row-span-2";
          else if (index === 3) spanClass = "lg:col-start-4 lg:row-span-2";

          const isTall = index === 2 || index === 3;

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
                <div
                  className={[
                    "relative bg-neutral-50",
                    isTall
                      ? "h-[520px] lg:h-[700px]"
                      : "h-[280px] sm:h-[360px]",
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

                {product.tag ? (
                  <span
                    className="absolute top-3 right-3 rounded-full
                               bg-white/85 backdrop-blur px-3 py-1
                               text-[11px] font-normal tracking-[0.14em] uppercase
                               text-neutral-700 border border-neutral-200"
                  >
                    {product.tag}
                  </span>
                ) : null}
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-[13px] sm:text-[14px] font-normal text-neutral-900 tracking-tight truncate">
                  {product.title}
                </p>

                <p className="mt-1 text-[13px] sm:text-[14px] text-neutral-500">
                  {product.hasPrice ? `$${product.price.toFixed(2)}` : "—"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
