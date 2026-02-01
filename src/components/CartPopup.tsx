"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CartPopup({
  show,
  count,
}: {
  show: boolean;
  count: number;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = elRef.current;

    if (show) {
      // mount แล้วค่อย animate in
      setMounted(true);
      requestAnimationFrame(() => {
        if (!el) return;

        gsap.killTweensOf(el);
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: -10, scale: 0.98, filter: "blur(6px)" },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power3.out",
          },
        );
      });
    } else {
      // animate out แล้วค่อย unmount
      if (!el) {
        setMounted(false);
        return;
      }

      gsap.killTweensOf(el);
      gsap.to(el, {
        autoAlpha: 0,
        y: -10,
        scale: 0.98,
        filter: "blur(6px)",
        duration: 0.25,
        ease: "power2.inOut",
        onComplete: () => setMounted(false),
      });
    }
  }, [show]);

  if (!mounted) return null;

  const label = `${count} item${count === 1 ? "" : "s"} in cart`;

  return (
    <div
      ref={elRef}
      className="fixed top-4 right-4 z-50
                 rounded-full border border-black/10 bg-white/90 backdrop-blur-md
                 px-4 py-2 shadow-sm"
      aria-live="polite"
    >
      <span className="text-[13px] font-normal tracking-[0.02em] text-black/80">
        {label}
      </span>
    </div>
  );
}
