"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { logos } from "../../data";

export default function LogoTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(tickerRef.current, {
        xPercent: -50,
        ease: "linear",
        duration: 15,
        repeat: -1,
      });
    }, tickerRef);

    return () => ctx.revert(); // cleanup
  }, []);

  return (
    <section className="py-24 overflow-x-clip">
      <div className="container">
        <h3 className="text-center text-xl">
          Already chosen by these market leaders
        </h3>
        <div className="mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div ref={tickerRef} className="flex gap-24 pr-24 w-max">
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
          </div>
        </div>
      </div>
    </section>
  );
}
