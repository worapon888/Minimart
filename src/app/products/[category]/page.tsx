"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ImSpinner2 } from "react-icons/im";
import { FaShoppingCart } from "react-icons/fa";
import gsap from "gsap";
import toast from "react-hot-toast";
import CartDrawer from "@/components/CartDrawer";

type CategoryProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string | null; // ✅ กัน empty string
  ratingValue: number; // 0..5
  ratingCount?: number;
  tag?: string;
};

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const { state, dispatch } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cartIconRef = useRef<HTMLDivElement>(null);
  const imageWrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!category) return;

    let alive = true;
    setLoading(true);

    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (!alive) return;

        const filtered = data
          .filter(
            (item) =>
              item.category?.toLowerCase() === String(category).toLowerCase(),
          )
          .map((item): CategoryProduct => {
            const raw =
              item.thumbnail?.trim() ||
              (Array.isArray(item.images) ? item.images[0]?.trim() : "") ||
              "";

            const image = raw ? raw : null;

            const tag = item.tags?.[0];

            // DummyJSON rating เป็น number (0..5)
            const ratingValue =
              typeof item.rating === "number"
                ? Math.max(0, Math.min(5, item.rating))
                : 0;

            // ถ้าอยากโชว์ count แต่ไม่มีจริง ใช้ stock แทน หรือปล่อย undefined
            const ratingCount =
              typeof item.stock === "number" ? item.stock : undefined;

            return {
              id: item.id,
              title: item.title,
              price: item.price,
              description: item.description,
              category: item.category,
              image,
              ratingValue,
              ratingCount,
              tag,
            };
          });

        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setProducts([]);
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [category]);

  // Entrance animation
  useEffect(() => {
    if (loading) return;
    const targets = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.killTweensOf(targets);
      gsap.set(targets, { opacity: 1 });

      gsap.fromTo(
        targets,
        { opacity: 0, y: 12, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.03,
          clearProps: "transform",
        },
      );
    });

    return () => ctx.revert();
  }, [loading, products]);

  const cartCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  );

  const animateToCart = (index: number) => {
    const wrap = imageWrapRefs.current[index];
    const icon = cartIconRef.current;
    if (!wrap || !icon) return;

    const img = wrap.querySelector("img");
    if (!img) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = icon.getBoundingClientRect();

    const clone = img.cloneNode(true) as HTMLImageElement;
    clone.style.position = "fixed";
    clone.style.left = `${imgRect.left}px`;
    clone.style.top = `${imgRect.top}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.borderRadius = "12px";

    document.body.appendChild(clone);

    gsap.to(clone, {
      duration: 0.75,
      left: cartRect.left + cartRect.width / 2 - imgRect.width * 0.15,
      top: cartRect.top + cartRect.height / 2 - imgRect.height * 0.15,
      scale: 0.3,
      opacity: 0.25,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(clone);
      },
    });
  };

  // ✅ ส่ง payload ที่โครงสร้างคล้าย Product ที่ Cart น่าจะใช้ได้
  const handleAddToCart = (product: CategoryProduct, index: number) => {
    const payload: Product = {
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,

      price: product.price,
      discountPercentage: 0,
      rating: product.ratingValue, // ✅ number
      stock: product.ratingCount ?? 0, // ใช้ stock เป็น count แทนได้

      tags: product.tag ? [product.tag] : [],
      brand: "",
      sku: "",

      weight: 0,
      dimensions: { width: 0, height: 0, depth: 0 },

      warrantyInformation: "",
      shippingInformation: "",
      availabilityStatus: "",

      reviews: [],

      returnPolicy: "",
      minimumOrderQuantity: 1,

      meta: {
        createdAt: "",
        updatedAt: "",
        barcode: "",
        qrCode: "",
      },

      images: product.image ? [product.image] : [],
      thumbnail: product.image ?? "",
    };

    dispatch({ type: "ADD_ITEM", payload });
    toast.success("Added to cart");
    animateToCart(index);
  };

  const title = String(category || "").replaceAll("-", " ");

  const renderStars = (value: number) => {
    const filled = Math.round(value);
    const empty = Math.max(0, 5 - filled);
    return (
      <>
        {"★".repeat(filled)}
        <span className="opacity-40">{"☆".repeat(empty)}</span>
      </>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
          Category
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-black/85 capitalize">
          {title}
        </h1>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <ImSpinner2 className="animate-spin text-3xl text-black/40" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-black/55">No products found.</p>
          <p className="mt-2 text-xs text-black/35">
            Try another category — keep it simple.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product, i) => (
            <div
              key={product.id}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="
                group rounded-2xl border border-black/10 bg-white
                p-4 sm:p-5
                transition
                hover:border-black/20 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.35)]
              "
            >
              {/* Image */}
              <div
                ref={(el) => {
                  imageWrapRefs.current[i] = el;
                }}
                className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-white"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="block w-full h-full"
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-neutral-400 text-sm">
                      No image
                    </div>
                  )}
                </Link>

                {product.tag && (
                  <span className="absolute top-3 left-3 rounded-full border border-black/10 bg-white/85 backdrop-blur px-2.5 py-1 text-[11px] tracking-wide text-black/70">
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 space-y-2">
                <h4 className="text-[15px] sm:text-base font-medium text-black/85 line-clamp-1">
                  {product.title}
                </h4>

                <p className="text-xs sm:text-sm text-black/50 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-base sm:text-lg font-semibold text-black/85">
                    ${product.price}
                  </p>

                  <div className="text-[12px] text-black/45">
                    {renderStars(product.ratingValue)}
                    {typeof product.ratingCount === "number" && (
                      <span className="ml-2 opacity-60">
                        ({product.ratingCount})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => handleAddToCart(product, i)}
                className="
                  mt-4 w-full rounded-full
                  bg-black text-white
                  py-2.5 text-[12px] uppercase tracking-[0.22em]
                  hover:bg-black/85 transition
                  focus:outline-none focus:ring-2 focus:ring-black/20
                "
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Cart Icon */}
      <div ref={cartIconRef} className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="
            relative grid place-items-center
            h-11 w-11 rounded-full
            border border-black/10
            bg-white/80 backdrop-blur
            shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)]
            hover:bg-white transition
            focus:outline-none focus:ring-2 focus:ring-black/15
          "
          aria-label="Open cart"
        >
          <FaShoppingCart className="text-[18px] text-black/70" />

          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 grid place-items-center h-5 min-w-5 rounded-full bg-black text-white text-[11px] px-1">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
          onClick={() => setCartOpen(false)}
        />
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
