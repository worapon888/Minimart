// ✅ useAnimateToCart.ts
import gsap from "gsap";
import { RefObject } from "react";

export function useAnimateToCart(cartIconRef: RefObject<HTMLDivElement>) {
  return (imgEl: HTMLImageElement | null) => {
    if (!imgEl || !cartIconRef.current) return;

    const cartRect = cartIconRef.current.getBoundingClientRect();
    const imgRect = imgEl.getBoundingClientRect();

    const clone = imgEl.cloneNode(true) as HTMLImageElement;
    Object.assign(clone.style, {
      position: "fixed",
      left: `${imgRect.left}px`,
      top: `${imgRect.top}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
      zIndex: "9999",
      pointerEvents: "none",
    });

    document.body.appendChild(clone);

    gsap.to(clone, {
      duration: 0.8,
      left: cartRect.left + cartRect.width / 2 - imgRect.width / 4,
      top: cartRect.top + cartRect.height / 2 - imgRect.height / 4,
      scale: 0.3,
      opacity: 0.5,
      ease: "power2.inOut",
      onComplete: () => void document.body.removeChild(clone),
    });
  };
}
