"use client";

import { useEffect, useMemo, useRef } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { CartItemLike } from "@/types/product";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useCart();

  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const checkoutBtnRef = useRef<HTMLButtonElement>(null);

  const items = (state.items as unknown as CartItemLike[]) ?? [];

  const totalPrice = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items],
  );

  useEffect(() => {
    const drawer = drawerRef.current;
    const overlay = overlayRef.current;
    const itemsWrap = itemsRef.current;

    // ✅ ทำให้ return เป็น void ชัดเจน
    if (!drawer || !overlay) {
      return; // <- จะไม่ error ถ้าคุณใช้โค้ดด้านล่างแบบนี้ไม่ได้
    }

    const itemElements = itemsWrap
      ? (Array.from(itemsWrap.querySelectorAll(".cart-item")) as HTMLElement[])
      : [];

    gsap.set(drawer, { xPercent: 110, autoAlpha: 0 });
    gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (isOpen) {
      tl.set(overlay, { pointerEvents: "auto" })
        .to(overlay, { autoAlpha: 1, duration: 0.18 }, 0)
        .to(drawer, { xPercent: 0, autoAlpha: 1, duration: 0.38 }, 0.02);

      if (itemElements.length) {
        tl.fromTo(
          itemElements,
          { autoAlpha: 0, y: 10 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.06,
            ease: "power2.out",
          },
          0.18,
        );
      }

      if (checkoutBtnRef.current) {
        tl.fromTo(
          checkoutBtnRef.current,
          { scale: 0.98 },
          { scale: 1, duration: 0.22, ease: "power2.out" },
          0.28,
        );
      }
    } else {
      tl.to(drawer, { xPercent: 110, autoAlpha: 0, duration: 0.28 }, 0).to(
        overlay,
        {
          autoAlpha: 0,
          duration: 0.18,
          onComplete: () => {
            gsap.set(overlay, { pointerEvents: "none" });
            return; // ✅ ทำให้ TS มองว่า onComplete คืน void แน่นอน
          },
        },
        0.05,
      );
    }

    // ✅ cleanup ต้อง return void
    return () => {
      tl.kill();
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="
          fixed inset-0 z-[90]
          bg-white backdrop-blur-[2px]
          transition-opacity duration-300
        "
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="
          fixed top-0 right-0 z-[100] h-full w-[92vw] sm:w-[420px]
          bg-white border-l border-black/10
          flex flex-col
        "
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Cart
            </p>
            <h2 className="mt-1 text-[15px] font-normal tracking-wide text-black/80">
              Your Cart
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              h-9 w-9 rounded-full
              border border-black/10 bg-white/60
              grid place-items-center
              hover:bg-white hover:border-black/20
              transition
            "
            aria-label="Close cart"
            type="button"
          >
            <FaTimes className="text-[14px] text-black/60" />
          </button>
        </div>

        {/* Items */}
        <div ref={itemsRef} className="flex-1 overflow-y-auto px-5 py-4 pb-40">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-black/50">Your cart is empty.</p>
              <p className="mt-2 text-xs text-black/35">
                Add something you love — keep it simple.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const imgSrc =
                  typeof item.thumbnail === "string" && item.thumbnail.trim()
                    ? item.thumbnail
                    : Array.isArray(item.images) &&
                        typeof item.images[0] === "string"
                      ? item.images[0]
                      : typeof item.image === "string" && item.image?.trim()
                        ? item.image
                        : "/placeholder.png";

                return (
                  <div
                    key={item.id}
                    className="
                      cart-item flex gap-4 items-start
                      rounded-2xl border border-black/10
                      bg-white/60
                      p-4
                    "
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white">
                      <Image
                        src={imgSrc}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-normal tracking-wide text-black/80 line-clamp-2">
                        {item.title}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        {/* Qty controls */}
                        <div className="inline-flex items-center rounded-full border border-black/10 bg-white/60">
                          <button
                            onClick={() =>
                              dispatch({
                                type: "DECREASE_QUANTITY",
                                payload: item.id,
                              })
                            }
                            className="
                              px-3 py-1 text-[12px] text-black/70
                              hover:bg-black/5 transition
                              rounded-l-full
                            "
                            aria-label="Decrease quantity"
                            type="button"
                          >
                            −
                          </button>

                          <span className="px-2 text-[12px] text-black/55">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              dispatch({
                                type: "INCREASE_QUANTITY",
                                payload: item.id,
                              })
                            }
                            className="
                              px-3 py-1 text-[12px] text-black/70
                              hover:bg-black/5 transition
                              rounded-r-full
                            "
                            aria-label="Increase quantity"
                            type="button"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-[12px] text-black/45">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        dispatch({ type: "REMOVE_ITEM", payload: item.id })
                      }
                      className="
                        mt-1 h-9 w-9 rounded-full
                        border border-black/10 bg-white/60
                        grid place-items-center
                        text-black/45
                        hover:text-black/70 hover:bg-white
                        transition
                      "
                      title="Remove item"
                      aria-label="Remove item"
                      type="button"
                    >
                      <FaTrash className="text-[14px]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="
              sticky bottom-0 shrink-0
              px-5 py-4
              border-t border-black/10
              bg-white/85 backdrop-blur-xl
              shadow-[0_-14px_30px_-26px_rgba(0,0,0,0.35)]
            "
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-[0.18em] text-black/45">
                Total
              </span>
              <span className="text-[14px] font-normal tracking-wide text-black/80">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <Link href="/checkout" className="block">
              <button
                ref={checkoutBtnRef}
                onClick={onClose}
                className="
                  mt-4 w-full rounded-full
                  bg-black text-white
                  py-3 text-[12px] uppercase tracking-[0.22em]
                  hover:bg-black/85 transition
                "
                type="button"
              >
                Checkout
              </button>
            </Link>

            <button
              onClick={() => dispatch({ type: "CLEAR_CART" })}
              className="
                mt-3 w-full rounded-full
                border border-black/10 bg-white/60
                py-3 text-[12px] uppercase tracking-[0.22em]
                text-black/60 hover:text-black/75 hover:bg-white
                transition
              "
              type="button"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
