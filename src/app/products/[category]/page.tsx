"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ImSpinner2 } from "react-icons/im";

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useCart();

  useEffect(() => {
    if (!category) return;

    fetch("/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        const filtered = data.filter(
          (item) =>
            item.category.toLowerCase() === String(category).toLowerCase()
        );
        setProducts(filtered);
        setLoading(false);
      });
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold capitalize mb-10 text-center">
        {String(category).replace("-", " ")}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <ImSpinner2 className="animate-spin text-4xl text-gray-500" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {products.map((product) => (
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
      )}
    </div>
  );
}
