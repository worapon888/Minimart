"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

const sizes = ["S", "M", "L", "XL", "2XL"];

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.id.toString() === id);
        setProduct(found || null);
      });
  }, [id]);

  if (!product)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-15 h-15 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <section className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-10 ">
      {/* Left - Images */}
      <div className="h-[600px] bg-white rounded-3xl group">
        <div className="relative w-full h-[600px] bg-white rounded-xl overflow-hidden flex justify-center items-center">
          <Image
            src={product.image || "/product/main.jpg"}
            alt={product.title}
            width={400}
            height={400}
            className="object-center object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        {/* <div className="flex gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-20 h-20 relative rounded-lg overflow-hidden"
            >
              <Image
                src={`/product/thumb${i}.jpg`}
                alt={`Thumbnail ${i}`}
                fill
                className="object-center object-contain"
              />
            </div>
          ))}
        </div> */}
      </div>

      {/* Right - Info */}
      <div className=" my-10">
        <p className="text-sm text-gray-500 mb-3">
          <a href="#" className="underline hover:text-black">
            T-Shirt
          </a>{" "}
          &gt;
          <a href="#" className="underline hover:text-black">
            {" "}
            T-shirt & Shirts
          </a>
        </p>
        <h1 className="text-4xl font-medium">{product.title}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-4xl font-medium mt-4">${product.price}</p>

        <div className="mt-6">
          <p className="text-xl font-medium mb-1">Size</p>
          <div className="flex gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`border px-5 py-2 rounded-xl my-2 text-sm hover:border-black transition cursor-pointer ${
                  selectedSize === size ? "bg-[#2F2F2F] text-white" : "bg-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-16 border px-2 py-1 rounded bg-white border-[#2F2F2F] text-center"
          />
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", payload: product })}
            className="bg-[#2F2F2F] text-white px-6 py-2 rounded-3xl hover:opacity-90 text-lg cursor-pointer"
          >
            Add to cart
          </button>
          <button className="border px-6 py-2 hover:bg-gray-100 bg-white text-lg rounded-3xl cursor-pointer">
            View cart
          </button>
        </div>
      </div>
    </section>
  );
}
