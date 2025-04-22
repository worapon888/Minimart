"use client";

import Image from "next/image";
import { Fragment, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { logos } from "../../data";

export default function LogoTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTicker, setShowTicker] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // รอให้ DOM render เสร็จก่อน แล้วใช้ requestAnimationFrame → setTimeout → ค่อย render motion.div
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (containerRef.current) {
          const totalWidth = containerRef.current.scrollWidth / 2;
          setWidth(totalWidth);
          setShowTicker(true);
        }
      }, 50); // delay 50ms ก็พอ
    });
  }, []);

  return (
    <section className="py-24 overflow-x-clip">
      <div className="container">
        <h3 className="text-center text-xl">
          Already chosen by these market leaders
        </h3>
        <div
          ref={containerRef}
          className="mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          {showTicker && width > 0 && (
            <motion.div
              className="flex gap-24 pr-24"
              initial={{ x: 0 }}
              animate={{ x: -width }}
              transition={{
                duration: 18,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {Array.from({ length: 2 }).map((_, i) => (
                <Fragment key={i}>
                  {logos.map((logo) => (
                    <Image
                      key={logo.name + i}
                      src={logo.image}
                      alt={logo.name}
                      width={120}
                      height={50}
                      className="object-contain"
                    />
                  ))}
                </Fragment>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
