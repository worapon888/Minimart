"use client";

import Image from "next/image";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { Category } from "@/types/product";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CategoriesProducts() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data));
  }, []);

  return (
    <section className="py-12 px-6 space-y-12">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Progress Bar */}
        <div className="w-full lg:flex-1 h-[6px] bg-gray-300 relative rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-[-60%] h-full w-[60%] bg-gradient-to-r from-gray-700 via-gray-900 to-transparent opacity-70"
            animate={{ x: "250%" }}
            transition={{
              duration: 3.5,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        </div>
        {/* Title + Button */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-2xl tracking-wide">
            Categories Products
          </span>
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-300 text-lg text-gray-800 hover:bg-gray-400 transition">
            <FaPlus className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            href={`/products/${cat.category.toLowerCase()}`}
            key={cat.category}
          >
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transform transition-all hover:scale-105 duration-400 cursor-pointer">
              <div className="relative h-60 sm:h-80">
                <Image
                  src={cat.image}
                  alt={cat.category}
                  fill
                  className="object-contain"
                />
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent px-4 py-4 text-center backdrop-blur-3xl">
                  <span className="text-2xl font-semibold text-white tracking-wide">
                    {cat.category}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
