"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

const routeOrder: Record<string, number> = {
  "/": 0,
  "/products": 1,
  "/about-us": 2,
  "/contact": 3,
};

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(1);
  const [key, setKey] = useState(pathname);

  useLayoutEffect(() => {
    const currentIndex = routeOrder[pathname] ?? 0;
    const prevIndex = routeOrder[prevPath.current] ?? 0;

    setDirection(currentIndex > prevIndex ? 1 : -1);
    prevPath.current = pathname;
    setKey(pathname);
  }, [pathname]);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // กัน tween ซ้อน
    gsap.killTweensOf(el);

    // ปรับค่าตามใจ
    const enterFrom = 28 * direction; // จุดเริ่ม
    const overshoot = 10 * direction; // เลยเป้าหมายนิดนึง
    const blurFrom = 10;

    const tl = gsap.timeline();

    // เซ็ตเริ่มต้น
    gsap.set(el, {
      xPercent: enterFrom,
      opacity: 0,
      filter: `blur(${blurFrom}px)`,
      transformOrigin: "50% 50%",
      willChange: "transform, filter, opacity",
    });

    // 1) ดึงเข้าแบบเร็ว ๆ เลยเป้าหมายนิด
    tl.to(el, {
      xPercent: overshoot,
      opacity: 1,
      filter: "blur(2px)",
      duration: 0.22,
      ease: "sine.out",
    });

    // 2) เด้งกลับเข้าที่แบบ jelly
    tl.to(
      el,
      {
        xPercent: 0,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "elastic.out(1, 0.6)",
      },
      "-=0.05",
    );

    return () => {
      // ออกแบบนุ่ม ๆ (ไม่ elastic จะดูเยอะไป)
      gsap.killTweensOf(el);
      gsap.to(el, {
        xPercent: -22 * direction,
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.28,
        ease: "power2.in",
      });
    };
  }, [key, direction]);

  return (
    <div key={key} ref={wrapperRef} className="w-full flex-grow min-h-full">
      {children}
    </div>
  );
}
