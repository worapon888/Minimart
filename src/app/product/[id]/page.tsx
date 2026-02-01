"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import gsap from "gsap";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";
import CartDrawer from "@/components/CartDrawer";

const sizes = ["S", "M", "L", "XL", "2XL"];

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const { state, dispatch } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);

  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);

  const cartCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  );

  useEffect(() => {
    let alive = true;

    fetch("/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (!alive) return;
        const found = data.find((p) => String(p.id) === String(id));
        setProduct(found || null);
      })
      .catch(() => {
        if (!alive) return;
        setProduct(null);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const ctx = gsap.context(() => {
      if (imageWrapRef.current) {
        gsap.fromTo(
          imageWrapRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        );
      }
      if (infoRef.current) {
        gsap.fromTo(
          infoRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45, delay: 0.06, ease: "power2.out" },
        );
      }
      if (actionsRef.current) {
        gsap.fromTo(
          actionsRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, delay: 0.12, ease: "power2.out" },
        );
      }
    });

    return () => ctx.revert();
  }, [product]);

  const animateToCart = () => {
    const wrap = imageWrapRef.current;
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
    clone.style.borderRadius = "14px";
    clone.style.filter = "saturate(0.95)";

    document.body.appendChild(clone);

    gsap.to(clone, {
      duration: 0.7,
      left: cartRect.left + cartRect.width / 2 - imgRect.width * 0.15,
      top: cartRect.top + cartRect.height / 2 - imgRect.height * 0.15,
      scale: 0.28,
      opacity: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(clone);
      },
    });
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center px-6">
        <div className="w-9 h-9 border border-black/20 border-t-black/60 rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ ใช้ thumbnail ก่อน ถ้าไม่มีค่อยใช้ images[0]
  const imgSrc =
    (product.thumbnail && product.thumbnail.trim()) ||
    (Array.isArray(product.images) && product.images[0]) ||
    null;

  // ✅ tag โชว์แค่ตัวแรกจาก tags[]
  const tag =
    Array.isArray(product.tags) && product.tags.length > 0
      ? product.tags[0]
      : undefined;

  // ✅ rating เป็น number แล้ว (0..5)
  const ratingValue = Math.max(0, Math.min(5, Number(product.rating || 0)));
  const filledStars = Math.round(ratingValue);

  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
        {/* Image */}
        <div
          ref={imageWrapRef}
          className="rounded-2xl border border-black/10 bg-black/[0.02] overflow-hidden"
        >
          <div className="relative w-full aspect-[4/5] flex items-center justify-center p-6">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={product.title}
                width={520}
                height={520}
                className="object-contain"
                priority
              />
            ) : (
              <div className="grid place-items-center w-full h-full text-black/35 text-sm">
                No image
              </div>
            )}

            {tag && (
              <span className="absolute top-4 left-4 rounded-full border border-black/10 bg-white/85 backdrop-blur px-2.5 py-1 text-[11px] tracking-wide text-black/70">
                {tag}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div ref={infoRef} className="flex flex-col">
          <p className="text-xs text-black/40">Product</p>

          <h1 className="mt-2 text-2xl sm:text-3xl font-medium text-black/80 leading-tight">
            {product.title}
          </h1>

          <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-black/50">
            {product.description}
          </p>

          <p className="mt-5 text-2xl sm:text-3xl font-medium text-black/75">
            ${product.price}
          </p>

          {/* Rating (DummyJSON style) */}
          <div className="mt-3 text-[12px] text-black/45">
            {"★".repeat(filledStars)}
            <span className="opacity-40">{"☆".repeat(5 - filledStars)}</span>
            <span className="ml-2 opacity-60">({ratingValue.toFixed(1)})</span>
          </div>

          {/* Size */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="text-sm text-black/70">Size</p>
              <p className="text-xs text-black/40">{selectedSize}</p>
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              {sizes.map((size) => {
                const active = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={[
                      "rounded-full px-4 py-2 text-xs transition border",
                      active
                        ? "border-black/60 text-black/80 bg-black/[0.04]"
                        : "border-black/10 text-black/55 hover:border-black/25 hover:bg-black/[0.03]",
                      "focus:outline-none focus:ring-2 focus:ring-black/10",
                    ].join(" ")}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div ref={actionsRef} className="mt-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-black/10 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-sm text-black/60 hover:bg-black/[0.03] rounded-l-full"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-3 text-sm text-black/60 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 text-sm text-black/60 hover:bg-black/[0.03] rounded-r-full"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  // ✅ ส่ง Product เต็ม ๆ (type ใหม่ตรงแล้ว)
                  // ถ้า CartContext ยังไม่รองรับ quantity/size ตอนนี้จะเพิ่มทีหลังได้
                  dispatch({ type: "ADD_ITEM", payload: product });
                  toast.success("Added to cart");
                  animateToCart();
                }}
                className="
                  flex-1 rounded-full bg-black text-white
                  py-3 text-sm font-medium
                  hover:bg-black/85 transition
                  focus:outline-none focus:ring-2 focus:ring-black/15
                "
              >
                Add to cart
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="
                w-full rounded-full border border-black/10 bg-white
                py-3 text-sm text-black/65
                hover:bg-black/[0.03] hover:border-black/20
                transition
                focus:outline-none focus:ring-2 focus:ring-black/10
              "
            >
              View cart
            </button>
          </div>
        </div>
      </div>

      {/* Cart Icon */}
      <div ref={cartIconRef} className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="
            relative grid place-items-center
            h-11 w-11 rounded-full
            border border-black/10 bg-white
            hover:bg-black/[0.02] transition
            focus:outline-none focus:ring-2 focus:ring-black/10
          "
          aria-label="Open cart"
        >
          <FaShoppingCart className="text-[18px] text-black/60" />
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
    </section>
  );
}
