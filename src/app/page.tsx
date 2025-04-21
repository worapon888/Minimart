"use client";

import Image from "next/image";
import { HeroImage } from "../../data";
import Link from "next/link";
import LogoTicker from "@/components/LogoTicker";
import FeaturesProducts from "@/components/FeaturesProducts";
import CategoriesProducts from "@/components/CategoreisProducts";
import WhyMinimalMart from "@/components/WhyMinimalMart";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="w-full py-10 container">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16 px-6">
        {/* Section A: Image Grid */}
        <div className="grid grid-cols-[1fr_1.2fr] grid-rows-2 gap-6 w-full max-w-5xl">
          {/* Sneaker */}
          <motion.div
            initial={{ scale: 0 }}
            animate={
              mounted ? { scale: [0, 1, 1.015, 1, 1.015, 1] } : { scale: 0 }
            }
            transition={{
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.3, 0.4, 0.6, 0.7, 1],
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.2,
            }}
            className="relative col-span-1 row-span-2 rounded-xl overflow-hidden aspect-[3/6] w-full"
          >
            <Image
              src={HeroImage[0].img}
              alt={HeroImage[0].alt}
              fill
              className="object-cover"
              priority
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={
                mounted
                  ? {
                      scale: [0, 1, 1.015, 1, 1.015, 1],
                      opacity: [0, 1, 1, 1, 1, 1],
                    }
                  : { scale: 0, opacity: 0 }
              }
              transition={{
                duration: 4,
                ease: "easeInOut",
                times: [0, 0.3, 0.4, 0.6, 0.7, 1],
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1,
              }}
              className="absolute top-1 left-1 px-4 py-2 font-semibold text-xl leading-tight stroke-layer"
            >
              <span className="block text-5xl font-normal stroke-layer">
                Live{" "}
                <span className="relative font-normal text-black text-[32px] z-0 leading-none stroke-layer">
                  <span className="absolute top-0 left-0 text-white z-[-1] stroke-layer">
                    less,
                  </span>
                  less,
                </span>
              </span>
              <span className="block text-gray-600 font-normal">
                feel more.
              </span>
            </motion.div>
          </motion.div>

          {/* Watch */}
          <motion.div
            initial={{ scale: 0 }}
            animate={
              mounted ? { scale: [0, 1, 1.015, 1, 1.015, 1] } : { scale: 0 }
            }
            transition={{
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.3, 0.4, 0.6, 0.7, 1],
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1.2,
            }}
            className="relative rounded-xl overflow-hidden aspect-[5/4] w-full"
          >
            <Image
              src={HeroImage[1].img}
              alt={HeroImage[1].alt}
              fill
              className="object-cover"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={
                mounted
                  ? {
                      scale: [0, 1, 1.015, 1, 1.015, 1],
                      opacity: [0, 1, 1, 1, 1, 1],
                    }
                  : { scale: 0, opacity: 0 }
              }
              transition={{
                duration: 4,
                ease: "easeInOut",
                times: [0, 0.3, 0.4, 0.6, 0.7, 1],
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1.5,
              }}
              className="absolute top-3 left-3 text-white text-sm font-medium px-3 py-2 rounded-md"
            >
              <span className="stroke-layer2 text-xl font-normal">
                <span className="text-3xl">Curated essentials</span> <br /> for
                a simpler life.
              </span>
            </motion.div>
          </motion.div>

          {/* Guy */}
          <motion.div
            initial={{ scale: 0 }}
            animate={
              mounted ? { scale: [0, 1, 1.015, 1, 1.015, 1] } : { scale: 0 }
            }
            transition={{
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.3, 0.4, 0.6, 0.7, 1],
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1.8,
            }}
            className="relative rounded-xl overflow-hidden aspect-[4/3] w-full"
          >
            <Image
              src={HeroImage[2].img}
              alt={HeroImage[2].alt}
              fill
              className="object-cover"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={
                mounted
                  ? {
                      scale: [0, 1, 1.015, 1, 1.015, 1],
                      opacity: [0, 1, 1, 1, 1, 1],
                    }
                  : { scale: 0, opacity: 0 }
              }
              transition={{
                duration: 4,
                ease: "easeInOut",
                times: [0, 0.3, 0.4, 0.6, 0.7, 1],
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2.1,
              }}
              className="absolute bottom-1 right-1 text-black text-sm font-medium text-right px-3 py-2 rounded-md backdrop-blur-sm"
            >
              <span className="stroke-layer3 text-3xl font-normal">
                Minimal goods <br /> for maximal <br /> living.
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Section B */}
        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.3,
              },
            },
          }}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          className="flex items-center justify-center flex-col md:text-left w-full max-w-md space-y-8"
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl text-center md:text-5xl font-light italic text-gray-700"
          >
            Simplify{" "}
            <span className="not-italic font-medium text-black">
              your lifestyle.
            </span>
          </motion.h2>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-3xl font-normal text-center"
          >
            Minimal goods for maximal living
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3,
            }}
          >
            <Link href="/products">
              <motion.button
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05 }}
                className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-[#252525] text-white rounded-full hover:bg-gray-800 transition"
              >
                <span>→</span> Shop Now
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <LogoTicker />
      <FeaturesProducts />
      <CategoriesProducts />
      <WhyMinimalMart />
    </section>
  );
}
