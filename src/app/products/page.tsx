"use client";

import { useEffect, useState } from "react";
import { products as allProducts } from "@/data/products";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 1000]);
  const { dispatch } = useCart();

  useEffect(() => {
    setProducts(allProducts);
    setFiltered(allProducts);
  }, []);

  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() || "";

  const handleFilter = () => {
    let result = products;

    // Search filter
    if (search) {
      result = result.filter((p) => p.title.toLowerCase().includes(search));
    }

    // Category filter
    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    setFiltered(result);
  };

  const uniqueCategories = [
    "All",
    ...Array.from(new Set(allProducts.map((p) => p.category))),
  ];

  useEffect(() => {
    setProducts(allProducts);
  }, []);

  useEffect(() => {
    handleFilter();
  }, [search, category, priceRange, products]);

  const handleClear = () => {
    setCategory("All");
    setPriceRange([10, 1000]);
    setFiltered(products);
  };

  return (
    <div className="container mx-auto px-6 py-12 grid md:grid-cols-4 gap-15">
      {/* Sidebar */}
      <aside className="md:col-span-1 space-y-6">
        <h3 className="text-2xl font-semibold">Categories</h3>

        {/* Price Filter */}
        <div className="space-y-4">
          <label className="text-lg font-medium">Price</label>

          {/* Slider */}
          <div className="relative w-full h-4 flex items-center ">
            {/* Track */}
            <div className="absolute w-full h-1 bg-[#8E8E8E] rounded" />

            {/* Min Range */}
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

            {/* Max Range */}
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

          {/* Labels under slider */}
          <div className="flex justify-between text-lg text-gray-600">
            <span>Min</span>
            <span>Max</span>
          </div>

          {/* Display value */}
          <div className="text-right">
            <p className="text-lg">
              Price: <span className="font-medium">${priceRange[0]}</span> -{" "}
              <span className="font-medium">${priceRange[1]}</span>
            </p>
          </div>
        </div>

        {/* Category Filter */}
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

      {/* Product Grid */}
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
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md hover:scale-105 transition-all duration-300 ease-in-out rounded-lg p-4 space-y-3"
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
