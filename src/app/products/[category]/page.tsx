"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ImSpinner2 } from "react-icons/im";
import { FaShoppingCart } from "react-icons/fa";
import gsap from "gsap";

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useCart();

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cartIconRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!loading && products.length > 0) {
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
            from: "start",
          },
          clearProps: "transform",
        });
      });

      return () => ctx.revert();
    }
  }, [loading, products]);

  useEffect(() => {
    const updatePosition = () => {
      const icon = cartIconRef.current;
      if (!icon) return;

      const scrollY = window.scrollY;
      icon.style.transform = `translateY(${scrollY}px)`;
    };

    window.addEventListener("scroll", updatePosition);
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const cartCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold capitalize mb-10 text-center text-gray-800">
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
          {products.map((product, i) => (
            <div
              key={product.id}
              ref={(el) => void (cardsRef.current[i] = el)}
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
                onClick={() => handleAddToCart(product)}
                className="w-full bg-[#2F2F2F] text-white py-2 rounded-full hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Cart Icon */}
      <div ref={cartIconRef} className="fixed top-4 right-4 z-50">
        <Link href="/checkout">
          <div className="relative">
            <div className="bg-white  shadow-lg rounded-full p-3">
              <FaShoppingCart className="text-xl text-gray-700" />
            </div>
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {cartCount}
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
