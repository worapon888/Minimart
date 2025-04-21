"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

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
  const [direction, setDirection] = useState(0);

  useLayoutEffect(() => {
    const currentIndex = routeOrder[pathname] ?? 0;
    const prevIndex = routeOrder[prevPath.current] ?? 0;
    setDirection(currentIndex > prevIndex ? 1 : -1);
    prevPath.current = pathname;
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{
          x: `${direction * 50}%`,
          opacity: 0,
          filter: "blur(8px)",
        }}
        animate={{
          x: "0%",
          opacity: 1,
          filter: "blur(0px)",
        }}
        exit={{
          x: `${direction * -50}%`,
          opacity: 0,
          filter: "blur(6px)",
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
