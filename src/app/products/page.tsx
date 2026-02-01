"use client";

import {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { products as allProducts } from "@/data/products";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import { FaShoppingCart } from "react-icons/fa";
import gsap from "gsap";
import toast from "react-hot-toast";
import CartDrawer from "@/components/CartDrawer";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 1000]);

  const { state, dispatch } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);

  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() || "";

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cartIconRef = useRef<HTMLDivElement>(null);
  const imageWrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // ถ้าอยากใช้ fetch ก็เปลี่ยนได้ แต่ตอนนี้คุณใช้ local data อยู่
    setProducts(allProducts);
    setFiltered(allProducts);
  }, []);

  const handleFilter = useCallback(() => {
    let result = products;

    if (search) {
      result = result.filter((p) => p.title.toLowerCase().includes(search));
    }
    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    setFiltered(result);
  }, [search, category, priceRange, products]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  // subtle grid entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const targets = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      gsap.killTweensOf(targets);
      gsap.set(targets, { opacity: 1 });

      gsap.fromTo(
        targets,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.03,
          clearProps: "transform",
        },
      );
    });

    return () => ctx.revert();
  }, [filtered]);

  const animateToCart = (wrapEl: HTMLDivElement | null) => {
    if (!wrapEl || !cartIconRef.current) return;

    const imgEl = wrapEl.querySelector("img") as HTMLImageElement | null;
    if (!imgEl) return;

    const cartRect = cartIconRef.current.getBoundingClientRect();
    const imgRect = imgEl.getBoundingClientRect();

    const clone = imgEl.cloneNode(true) as HTMLImageElement;
    clone.style.position = "fixed";
    clone.style.left = `${imgRect.left}px`;
    clone.style.top = `${imgRect.top}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.borderRadius = "16px";
    clone.style.background = "white";

    document.body.appendChild(clone);

    gsap.to(clone, {
      duration: 0.75,
      left: cartRect.left + cartRect.width / 2 - imgRect.width / 4,
      top: cartRect.top + cartRect.height / 2 - imgRect.height / 4,
      scale: 0.25,
      opacity: 0.35,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(clone);
      },
    });
  };

  const handleClear = () => {
    setCategory("All");
    setPriceRange([10, 1000]);
    setFiltered(products);
  };

  const cartCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const uniqueCategories = [
    "All",
    ...Array.from(new Set(allProducts.map((p) => p.category))),
  ];

  const min = priceRange[0];
  const max = priceRange[1];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Top breadcrumb */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Home / Products
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-normal tracking-tight text-black/85">
              Products
            </h1>
            <p className="mt-2 text-sm text-black/55">
              Showing <span className="text-black/80">{filtered.length}</span>{" "}
              of <span className="text-black/80">{products.length}</span>{" "}
              results
              {search ? (
                <>
                  {" "}
                  for{" "}
                  <span className="text-black/80">&quot;{search}&quot;</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          {/* Filters */}
          <aside className="md:sticky md:top-10 h-fit rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] uppercase tracking-[0.22em] text-black/55">
                Filters
              </h3>
              <button
                onClick={handleClear}
                className="text-[12px] text-black/50 hover:text-black/75 underline underline-offset-4"
                type="button"
              >
                Reset
              </button>
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-sm text-black/70">Price range</p>

              <div className="mt-4 relative h-8">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/10 rounded-full" />

                <input
                  type="range"
                  min={10}
                  max={1000}
                  value={min}
                  onChange={(e) =>
                    setPriceRange([Math.min(+e.target.value, max - 1), max])
                  }
                  className="
                    absolute inset-0 w-full bg-transparent appearance-none pointer-events-none
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-black
                    [&::-webkit-slider-thumb]:pointer-events-auto
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-black
                    [&::-moz-range-thumb]:pointer-events-auto
                  "
                />

                <input
                  type="range"
                  min={10}
                  max={1000}
                  value={max}
                  onChange={(e) =>
                    setPriceRange([min, Math.max(+e.target.value, min + 1)])
                  }
                  className="
                    absolute inset-0 w-full bg-transparent appearance-none pointer-events-none
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-black
                    [&::-webkit-slider-thumb]:pointer-events-auto
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-black
                    [&::-moz-range-thumb]:pointer-events-auto
                  "
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-black/55">
                <span>${min}</span>
                <span>${max}</span>
              </div>
            </div>

            {/* Category */}
            <div className="mt-6">
              <label className="text-sm text-black/70">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="
                  mt-2 w-full rounded-2xl
                  border border-black/10 bg-white/70
                  px-4 py-3 text-sm text-black/80
                  outline-none
                  focus:border-black/25 focus:ring-2 focus:ring-black/10
                  transition
                "
              >
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={handleFilter}
                className="
                  rounded-full bg-black text-white
                  py-3 text-[12px] uppercase tracking-[0.22em]
                  hover:bg-black/85 transition
                "
                type="button"
              >
                Apply
              </button>
              <button
                onClick={handleClear}
                className="
                  rounded-full border border-black/10 bg-white/50
                  py-3 text-[12px] uppercase tracking-[0.22em]
                  text-black/60 hover:text-black/75 hover:bg-white
                  transition
                "
                type="button"
              >
                Clear
              </button>
            </div>
          </aside>

          {/* Products */}
          <main>
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-black/10 bg-white/60 p-10 text-center">
                <p className="text-sm text-black/60">No products found.</p>
                <p className="mt-2 text-xs text-black/40">
                  Try adjusting your filters or search keywords.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((product, index) => {
                  const imgSrc =
                    (product.thumbnail && product.thumbnail.trim()) ||
                    (Array.isArray(product.images) && product.images[0]) ||
                    null;

                  const tag =
                    Array.isArray(product.tags) && product.tags.length > 0
                      ? product.tags[0]
                      : undefined;

                  const ratingValue =
                    typeof product.rating === "number" ? product.rating : 0;

                  return (
                    <div
                      key={product.id}
                      ref={(el) => {
                        cardsRef.current[index] = el;
                      }}
                      className="
                        rounded-3xl border border-black/10
                        bg-white/70 backdrop-blur-xl
                        p-4
                        transition
                        hover:bg-white hover:border-black/15
                      "
                    >
                      <div
                        ref={(el) => {
                          imageWrapRefs.current[index] = el;
                        }}
                        className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl border border-black/5 bg-white"
                      >
                        <Link
                          href={`/product/${product.id}`}
                          className="block w-full h-full"
                        >
                          {imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt={product.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center text-black/35 text-sm">
                              No image
                            </div>
                          )}
                        </Link>

                        {tag ? (
                          <span className="absolute left-3 top-3 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] text-black/70">
                            {tag}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-normal tracking-wide text-black/85 line-clamp-1">
                          {product.title}
                        </h4>
                        <p className="mt-1 text-xs text-black/50 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-base font-normal text-black/80">
                            ${product.price}
                          </p>

                          <div className="text-xs text-black/45">
                            <span className="text-black/70">
                              {ratingValue.toFixed(1)}
                            </span>{" "}
                            / 5
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            dispatch({ type: "ADD_ITEM", payload: product });
                            toast.success("Added to cart");
                            animateToCart(imageWrapRefs.current[index]);
                          }}
                          className="
                            mt-4 w-full rounded-full
                            bg-black text-white
                            py-3 text-[12px] uppercase tracking-[0.22em]
                            hover:bg-black/85 transition
                            cursor-pointer
                          "
                          type="button"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* Floating cart button */}
        <div ref={cartIconRef} className="fixed top-5 right-5 z-[80]">
          <button
            onClick={() => setCartOpen(true)}
            className="
              relative grid place-items-center
              size-12 rounded-full
              border border-black/10 bg-white/80 backdrop-blur-xl
              shadow-[0_10px_30px_-20px_rgba(0,0,0,0.45)]
              hover:bg-white transition
            "
            aria-label="Open cart"
            type="button"
          >
            <FaShoppingCart className="text-[18px] text-black/70" />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 grid place-items-center size-5 rounded-full bg-black text-white text-[10px]">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* Backdrop */}
        {isCartOpen ? (
          <div
            className="fixed inset-0 z-[70] bg-black/10 backdrop-blur-[2px]"
            onClick={() => setCartOpen(false)}
          />
        ) : null}

        <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </div>
  );
}
