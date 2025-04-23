"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { FaSearch, FaShoppingBag, FaUser } from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { NavbarItem } from "../../data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoMdExit } from "react-icons/io";
import gsap from "gsap";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useCart();
  const cartCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setCartOpen] = useState(false);

  // const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const indicatorRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Bounce cart icon เมื่อ cartCount เปลี่ยน
    if (cartRef.current && isMounted && cartCount > 0) {
      gsap.fromTo(
        cartRef.current,
        { scale: 1 },
        {
          scale: 1.15,
          duration: 0.25,
          yoyo: true,
          repeat: 1,
          ease: "power1.out",
        }
      );
    }
  }, [cartCount]);

  useLayoutEffect(() => {
    if (menuOpen && mobileMenuRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          mobileMenuRef.current,
          { opacity: 0, y: -20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          }
        );
      });

      return () => ctx.revert();
    }
  }, [menuOpen]);

  useLayoutEffect(() => {
    // Animation ตอนโหลดเข้า
    if (searchRef.current) {
      gsap.fromTo(
        searchRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
    if (cartRef.current) {
      gsap.fromTo(
        cartRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, []);

  useEffect(() => {
    const activeLink = document.querySelector(
      `a[data-active="true"]`
    ) as HTMLElement;
    const container = navContainerRef.current;

    if (activeLink && container && indicatorRef.current) {
      const linkBox = activeLink.getBoundingClientRect();
      const containerBox = container.getBoundingClientRect();
      const offset = linkBox.left - containerBox.left;

      gsap.to(indicatorRef.current, {
        x: offset,
        width: linkBox.width,
        duration: 0.4,
        ease: "power3.out",
      });
    } else {
      // 🔥 fallback: ซ่อนไว้ถ้าไม่มี active link
      gsap.to(indicatorRef.current, {
        width: 0,
        duration: 0.2,
      });
    }
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query.length > 1) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="container mx-auto py-6 px-6 flex items-center justify-between w-full  relative">
      <div className="flex items-center gap-1 text-xl font-semibold">
        <Link href="/">
          <Image src="/Logo.png" alt="logo" width={200} height={100} />
        </Link>
      </div>

      {/* 🔧 Hamburger Toggle Button - แสดงเฉพาะบน mobile */}
      <div className="lg:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl">
          {menuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* 🔒 Desktop Navbar */}
      <nav className="hidden lg:flex items-center text-base">
        <div
          ref={navContainerRef}
          className="relative bg-white font-medium rounded-full flex items-center gap-2 px-1 py-1"
        >
          <div
            ref={indicatorRef}
            className="absolute top-0 left-0 h-full bg-black rounded-full z-0"
            style={{ width: 0 }}
          />
          {NavbarItem.map((nav) => {
            const isActive = pathname === nav.href;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                data-active={isActive ? "true" : "false"}
                className="relative px-6 py-2 flex items-center justify-center rounded-full text-sm font-medium z-10 text-black"
              >
                <span className={isActive ? "text-white" : "text-black"}>
                  {nav.item}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 📱 Mobile Menu (Dropdown style) */}
      {menuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-full left-0 w-full bg-white/60 backdrop-blur-3xl rounded-2xl shadow-lg rounded-b-lg z-50 lg:hidden mt-4"
        >
          <nav className="flex flex-col items-center gap-4 py-4">
            {NavbarItem.map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-gray-800 hover:text-black"
              >
                {nav.item}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Right Icons - Desktop */}
      <div className="hidden lg:flex items-center gap-5">
        <form
          onSubmit={handleSearch}
          ref={searchRef}
          className="flex items-center bg-white rounded-full px-5 py-2 hover:shadow-md hover:scale-[1.03] transition-all duration-300 ease-in-out focus-within:shadow-lg focus-within:ring-1 focus-within:ring-[#272727]"
        >
          <FaSearch className="mr-2 text-lg" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-base font-normal"
          />
        </form>
        <div
          onClick={() => setCartOpen(true)} // ✅ เปิด Drawer
          className="relative bg-gray-200 rounded-full p-3 cursor-pointer 
    transition-all duration-300 
    ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] 
    hover:scale-110 hover:shadow-lg 
    active:scale-95 active:shadow-inner 
    hover:bg-amber-400"
          title="Cart"
        >
          <FaShoppingBag className="text-xl text-gray-800" />
          {isMounted && cartCount > 0 && (
            <span className="absolute -top-1 -right-1 text-[13px] bg-red-500 text-white px-1.5 rounded-full shadow-md">
              {cartCount}
            </span>
          )}
        </div>
        {/* ✅ Fly-out Drawer */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105">
                <AvatarImage src={session.user.image || ""} alt="User Avatar" />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white border-none"
              align="end"
            >
              <div className="px-3 py-1.5 text-[15px] tracking-widest font-medium">
                {session.user.name}
              </div>
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer bg-[#4b4b4b]/50 backdrop-blur-3xl text-white font-medium text-lg flex items-center justify-center hover:scale-105 transition duration-300"
              >
                <IoMdExit className="text-4xl" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            onClick={() => router.push("/login")}
            className="bg-gray-200 rounded-full p-3 cursor-pointer 
            transition-all duration-300 
            ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] 
            hover:scale-110 hover:shadow-lg 
            active:scale-95 active:shadow-inner hover:bg-amber-400"
            title="Sign in"
          >
            <FaUser className="text-xl text-gray-800" />
          </div>
        )}
      </div>
    </header>
  );
}
