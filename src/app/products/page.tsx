"use client";

import {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { products as allProducts } from "@/data/products";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 1000]);
  const { dispatch } = useCart();

  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() || "";

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setProducts(allProducts);
    setFiltered(allProducts);
  }, []);

  const handleFilter = useCallback(() => {
    let result = products;

    if (search) {
      result = result.filter((p) => p.title.toLowerCase().includes(search));
    }

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    setFiltered(result);
  }, [search, category, priceRange, products]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const targets = cardsRef.current.filter(Boolean);

      gsap.killTweensOf(targets);
      gsap.set(targets, { opacity: 1 });

      gsap.from(targets, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
        yoyo: true,
        stagger: {
          each: 0.02,

          from: "start", // หรือลอง "center" ถ้าอยากให้เด้งจากตรงกลาง
        },
        clearProps: "transform",
      });
    });

    return () => ctx.revert();
  }, [filtered]);

  const uniqueCategories = [
    "All",
    ...Array.from(new Set(allProducts.map((p) => p.category))),
  ];

  const handleClear = () => {
    setCategory("All");
    setPriceRange([10, 1000]);
    setFiltered(products);
  };

  return (
    <div className="container mx-auto px-6 py-12 grid md:grid-cols-4 gap-15">
      <aside className="md:col-span-1 space-y-6">
        <h3 className="text-2xl font-semibold">Categories</h3>

        <div className="space-y-4">
          <label className="text-lg font-medium">Price</label>

          <div className="relative w-full h-4 flex items-center ">
            <div className="absolute w-full h-1 bg-[#8E8E8E] rounded" />

            <input
              type="range"
              min={10}
              max={1000}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([
                  Math.min(+e.target.value, priceRange[1] - 1),
                  priceRange[1],
                ])
              }
              className="absolute w-full pointer-events-none appearance-none bg-transparent cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:bg-black
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:pointer-events-auto
        [&::-moz-range-thumb]:bg-black"
            />

            <input
              type="range"
              min={10}
              max={1000}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([
                  priceRange[0],
                  Math.max(+e.target.value, priceRange[0] + 1),
                ])
              }
              className="absolute w-full pointer-events-none cursor-pointer appearance-none bg-transparent
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:bg-black
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:pointer-events-auto
        [&::-moz-range-thumb]:bg-black"
            />
          </div>

          <div className="flex justify-between text-lg text-gray-600">
            <span>Min</span>
            <span>Max</span>
          </div>

          <div className="text-right">
            <p className="text-lg">
              Price: <span className="font-medium">${priceRange[0]}</span> -{" "}
              <span className="font-medium">${priceRange[1]}</span>
            </p>
          </div>
        </div>

        <div className="space-x-5">
          <label className="text-lg font-medium">Categories</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border px-3 py-2 mt-2 rounded-2xl bg-white"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleFilter}
            className="bg-[#2F2F2F] text-white px-4 py-1 rounded-full"
          >
            FILTER
          </button>
          <button
            onClick={handleClear}
            className="border px-4 py-1 rounded-full"
          >
            Clear
          </button>
        </div>
      </aside>

      <main className="md:col-span-3">
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Home / Products
            <br />
            <span className="font-semibold">
              Showing {filtered.length} of {products.length} results
            </span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="bg-white shadow-md rounded-lg p-4 space-y-3
             transform transition-transform duration-500
             ease-[cubic-bezier(0.25,0.8,0.25,1)]
             hover:scale-105 hover:shadow-2xl origin-center"
            >
              <div className="relative w-full h-64 rounded overflow-hidden">
                <Link href={`/product/${product.id}`}>
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                </Link>
                {product.tag && (
                  <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                    {product.tag}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-semibold line-clamp-1">
                  {product.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-1 text-yellow-500 text-lg">
                  {"★".repeat(Math.round(product.rating.rate))}
                  {"☆".repeat(5 - Math.round(product.rating.rate))}
                  <span className="ml-2 text-gray-500">
                    ({product.rating.count})
                  </span>
                </div>
                <p className="text-2xl font-semibold">${product.price}</p>
              </div>

              <button
                onClick={() => dispatch({ type: "ADD_ITEM", payload: product })}
                className="w-full bg-[#2F2F2F] text-white py-2 rounded-full hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
