import { useEffect, useRef } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLButtonElement>(null);

  // Animate on open/close
  useEffect(() => {
    if (!drawerRef.current) return;

    const drawer = drawerRef.current;
    const items = itemsRef.current;

    if (isOpen) {
      gsap.to(drawer, {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
        pointerEvents: "auto",
      });

      const itemElements = items?.querySelectorAll(".cart-item");

      if (itemElements && itemElements.length > 0) {
        gsap.fromTo(
          itemElements,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.2,
            ease: "power2.out",
          }
        );
      }

      if (badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { scale: 1 },
          {
            scale: 1.3,
            duration: 0.2,
            ease: "back.out(2)",
            yoyo: true,
            repeat: 1,
          }
        );
      }
    } else {
      gsap.to(drawer, {
        x: 400,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
        pointerEvents: "none",
      });
    }
  }, [isOpen]);

  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      ref={drawerRef}
      className="fixed top-0 right-0 h-full w-96 bg-[#eeeeee] shadow-2xl z-[100] 
        flex flex-col opacity-0 translate-x-full"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-b-neutral-500/40">
        <h2 className="text-xl font-bold tracking-tight">Your Cart</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      {/* Items */}
      <div ref={itemsRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.items.length === 0 ? (
          <p className="text-gray-500 text-sm">Your cart is empty.</p>
        ) : (
          state.items.map((item) => (
            <div
              key={item.id}
              className="cart-item flex gap-3 items-center border-b border-b-neutral-500/40 pb-3"
            >
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-neutral-500/40">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col flex-grow">
                <span className="text-sm font-medium line-clamp-2">
                  {item.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() =>
                      dispatch({
                        type: "DECREASE_QUANTITY",
                        payload: item.id,
                      })
                    }
                    className="px-2 py-1 text-sm bg-red-200 rounded hover:bg-red-300 cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "INCREASE_QUANTITY",
                        payload: item.id,
                      })
                    }
                    className="px-2 py-1 text-sm bg-green-200 rounded hover:bg-green-300 cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-600">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  dispatch({ type: "REMOVE_ITEM", payload: item.id })
                }
                className="text-red-500 hover:text-red-700 transition cursor-pointer"
                title="Remove item"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {state.items.length > 0 && (
        <div className="p-4 border-t border-t-neutral-300/40 space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <Link href="/checkout" passHref>
            <button
              onClick={onClose}
              className="w-full cursor-pointer bg-[#2F2F2F] text-white py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition"
              ref={badgeRef}
            >
              Go to Checkout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
