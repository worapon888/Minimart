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
    setKey(pathname); // trigger re-render
  }, [pathname]);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const el = wrapperRef.current;

    const tl = gsap.timeline();

    tl.fromTo(
      el,
      {
        xPercent: 50 * direction,
        opacity: 0,
        filter: "blur(8px)",
      },
      {
        xPercent: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "expo.out", // 👈 ลองเปลี่ยนเป็น curve ที่คุณชอบ
      }
    );

    return () => {
      gsap.to(el, {
        xPercent: -50 * direction,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.4,
        ease: "power2.in", // 👈 ease ออกอาจใช้ soft กว่าได้
      });
    };
  }, [key, direction]);

  return (
    <div key={key} ref={wrapperRef} className="w-full flex-grow min-h-full">
      {children}
    </div>
  );
}
