"use client";

import { FaPlus } from "react-icons/fa";

import Image from "next/image";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FeaturesProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // ถ้าใช้ mock แบบที่คุณมี ใช้ title → name
        const featured = data.slice(0, 4).map((item: Product) => ({
          id: item.id.toString(),
          title: item.title,
          price: item.price,
          image: item.image,
          category: item.category,
          tag: item.tag,
        }));
        setProducts(featured);
      });
  }, []);

  return (
    <section className="py-5 px-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Progress Bar */}
        <div className="w-full lg:flex-1 h-[6px] bg-gray-300 relative rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-[-60%] h-full w-[60%] bg-gradient-to-r from-gray-700 via-gray-900 to-transparent opacity-70"
            animate={{ x: "290%" }}
            transition={{
              duration: 3.5,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        </div>

        {/* Header Text + Button */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-2xl tracking-wide">
            Features Products
          </span>
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-300 text-lg font-medium text-gray-800 hover:bg-gray-400 transition">
            <FaPlus className="text-2xl" />
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-medium py-8 tracking-wide">
        “Top picks curated for you”
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {products.map((product, index) => {
          let spanClass = "";

          // ✅ Layout ซับซ้อนเฉพาะบนจอใหญ่
          if (index === 0) {
            spanClass = "lg:col-span-2 lg:row-span-1";
          } else if (index === 1) {
            spanClass = "lg:col-span-2 lg:row-start-2 lg:row-span-1";
          } else if (index === 2) {
            spanClass = "lg:col-start-3 lg:row-span-2";
          } else if (index === 3) {
            spanClass = "lg:col-start-4 lg:row-span-2";
          }

          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className={`rounded-xl overflow-hidden bg-white shadow-sm ${spanClass} flex flex-col transform transition-all hover:scale-105 duration-400`}
            >
              <div className="relative h-full">
                {index === 2 || index === 3 ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={700}
                    height={700}
                    className="w-full h-[700px] object-contain"
                  />
                ) : (
                  <div className="relative h-[300px] sm:h-[400px] lg:h-full">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
                {product.tag && (
                  <span className="absolute top-3 right-3 bg-white text-gray-800 text-lg px-5 py-2 rounded shadow-sm">
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-xl tracking-wider truncate">
                  {product.title}
                </p>
                <p className="text-gray-600 text-xl font-medium">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
