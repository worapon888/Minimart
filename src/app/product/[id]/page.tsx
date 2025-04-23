"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import gsap from "gsap";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";
import CartDrawer from "@/components/CartDrawer";

const sizes = ["S", "M", "L", "XL", "2XL"];

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const cartCount = useCart().state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // 🌀 Refs for animation
  const imageRef = useRef(null);
  const infoRef = useRef(null);
  const buttonsRef = useRef(null);
  const cartIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.id.toString() === id);
        setProduct(found || null);
      });
  }, [id]);

  // 🎞 GSAP Motion
  useEffect(() => {
    if (product) {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out" }
      );
      gsap.fromTo(
        infoRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
      );
      gsap.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: "power2.out" }
      );
    }
  }, [product]);

  useEffect(() => {
    const updatePosition = () => {
      const icon = cartIconRef.current;
      if (!icon) return;

      icon.style.transform = `translateY(${window.scrollY}px)`;
    };

    window.addEventListener("scroll", updatePosition);
    updatePosition();

    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  if (!product)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-15 h-15 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  const animateToCart = (sourceEl: HTMLDivElement | null) => {
    if (!sourceEl || !cartIconRef.current) return;

    const img = sourceEl.querySelector("img");
    if (!img) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cartIconRef.current.getBoundingClientRect();

    const clone = img.cloneNode(true) as HTMLImageElement;
    clone.style.position = "fixed";
    clone.style.left = `${imgRect.left}px`;
    clone.style.top = `${imgRect.top}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";

    document.body.appendChild(clone);

    gsap.to(clone, {
      duration: 0.8,
      left: cartRect.left + cartRect.width / 2 - imgRect.width / 4,
      top: cartRect.top + cartRect.height / 2 - imgRect.height / 4,
      scale: 0.3,
      opacity: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(clone);
      },
    });
  };

  return (
    <section className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Left - Images */}
      <div
        ref={imageRef}
        className="h-[600px] bg-white rounded-3xl group overflow-hidden"
      >
        <div className="relative w-full h-[600px] flex justify-center items-center">
          <Image
            src={product.image || "/product/main.jpg"}
            alt={product.title}
            width={400}
            height={400}
            className="object-center object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
      </div>

      {/* Right - Info */}
      <div ref={infoRef} className="my-10">
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
          <div className="flex gap-2 flex-wrap">
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

        <div
          ref={buttonsRef}
          className="flex items-center gap-4 mt-6 flex-wrap"
        >
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-16 border px-2 py-1 rounded bg-white border-[#2F2F2F] text-center"
          />
          <button
            onClick={() => {
              dispatch({ type: "ADD_ITEM", payload: product });
              toast.success(" Added to cart successfully!");
              animateToCart(imageRef.current);
            }}
            className="bg-[#2F2F2F] text-white px-6 py-2 rounded-3xl hover:opacity-90 text-lg cursor-pointer"
          >
            Add to cart
          </button>

          <button className="border px-6 py-2 hover:bg-gray-100 bg-white text-lg rounded-3xl cursor-pointer">
            View cart
          </button>
        </div>
      </div>
      {/* Floating Cart Icon */}
      <div ref={cartIconRef} className="fixed top-4 right-4 z-50">
        <div className="relative">
          <div
            className="bg-white  shadow-lg rounded-full p-3 cursor-pointer"
            onClick={() => setCartOpen(true)}
          >
            <FaShoppingCart className="text-xl text-gray-700" />
          </div>
          {cartCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
              {cartCount}
            </div>
          )}
        </div>
      </div>
      {/* Fly-out Cart Drawer */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-[#eeeeee]/50 backdrop-blur-sm z-40"
          onClick={() => setCartOpen(false)}
        />
      )}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </section>
  );
}
