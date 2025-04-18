"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "../../data";
import { FaPlus } from "react-icons/fa";

export default function CategoriesProducts() {
  return (
    <section className="py-12 px-6 space-y-12">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 h-[6px] bg-gray-300 relative mr-4 rounded-full overflow-hidden">
          <div className="absolute top-0 right-0 h-full bg-gray-800 w-2/4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-2xl tracking-wide">
            Features Products
          </span>
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-300 text-lg text-gray-800 hover:bg-gray-400 transition">
            <FaPlus className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link href={`/products/${cat.name.toLowerCase()}`} key={cat.name}>
            <div className="rounded-2xl overflow-hidden  bg-white shadow-sm hover:shadow-lg transform transition-all hover:scale-105 duration-400 cursor-pointer">
              <div className="relative h-60 sm:h-80">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent px-4 py-4 text-center backdrop-blur-3xl">
                  <span className="text-2xl font-semibold text-white  tracking-wide">
                    {cat.name}
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
