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
    0,
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
        },
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
          },
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
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );
    }
    if (cartRef.current) {
      gsap.fromTo(
        cartRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
      );
    }
  }, []);

  useEffect(() => {
    const activeLink = document.querySelector(
      `a[data-active="true"]`,
    ) as HTMLElement | null;

    const container = navContainerRef.current;
    const indicator = indicatorRef.current;

    if (!activeLink || !container || !indicator) {
      gsap.to(indicator, { width: 0, duration: 0.2 });
      return;
    }

    const linkBox = activeLink.getBoundingClientRect();
    const containerBox = container.getBoundingClientRect();

    const targetX = linkBox.left - containerBox.left;
    const targetW = linkBox.width;

    // current position (ไว้ใช้ทำ overshoot แบบฉลาด ๆ)
    const currentX = gsap.getProperty(indicator, "x") as number;
    const goingRight = targetX > currentX;

    const overshoot = Math.min(18, Math.max(10, targetW * 0.12)); // ปรับได้
    const stretchW = Math.min(24, Math.max(12, targetW * 0.18)); // ปรับได้

    // kill timeline เก่าก่อน กันทับกัน
    gsap.killTweensOf(indicator);

    const tl = gsap.timeline();

    // 1) “ลากหัว” ไปก่อน + width ยืดเล็กน้อย (เหมือนโดนดึง)
    tl.to(indicator, {
      x: targetX + (goingRight ? overshoot : -overshoot),
      width: targetW + stretchW,
      duration: 0.22,
      ease: "sine.out",
    });

    // 2) “ปล่อยตัว” ให้เด้งกลับเข้าที่ (jelly feel)
    tl.to(
      indicator,
      {
        x: targetX,
        width: targetW,
        duration: 0.55,
        ease: "elastic.out(1, 0.55)",
      },
      "-=0.06",
    );
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
          className="
    relative 
    bg-white/80 
    backdrop-blur-sm
    font-medium 
    rounded-full 
    border 
    border-gray-200 
    flex 
    items-center 
    gap-2 
    -px-2 
    py-1
    shadow-sm
  "
        >
          <div
            ref={indicatorRef}
            className="
    absolute top-0 left-0 
    h-full 
    bg-black/70 
    rounded-full 
    z-0 
    shadow-sm
  "
            style={{ width: 0 }}
          />

          {NavbarItem.map((nav) => {
            const isActive = pathname === nav.href;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                data-active={isActive ? "true" : "false"}
                className="relative px-5 py-2 flex items-center justify-center rounded-full z-10
             text-[12px] sm:text-[13px] font-normal tracking-[0.18em]
             text-neutral-700 transition-colors"
              >
                <span className={isActive ? "text-white" : "text-neutral-600"}>
                  {nav.item}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 📱 Mobile Menu (Minimal) */}
      {menuOpen && (
        <div
          ref={mobileMenuRef}
          className="
      absolute left-0 w-full lg:hidden mt-4 z-50
      rounded-2xl border border-black/5
      bg-white/80 backdrop-blur-xl
      shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]
    "
        >
          <nav className="flex flex-col items-center gap-3 py-5">
            {NavbarItem.map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                onClick={() => setMenuOpen(false)}
                className="
            text-[13px] uppercase tracking-[0.18em]
            text-black/70 hover:text-black
            transition-colors
          "
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
          className="
    flex items-center rounded-full
    border border-black/10 bg-white/70 backdrop-blur
    px-4 py-2
    transition
    focus-within:border-black/25
  "
        >
          <FaSearch className="mr-2 text-[14px] text-black/50" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
      w-40 bg-transparent outline-none
      text-[13px] tracking-wide text-black/80
      placeholder:text-black/35
    "
          />
        </form>

        <div
          onClick={() => setCartOpen(true)}
          className="
    relative cursor-pointer rounded-full
    border border-black/10 bg-white/70 backdrop-blur
    p-3
    transition
    hover:bg-white
    hover:border-black/20
    active:scale-[0.98]
  "
          title="Cart"
        >
          <FaShoppingBag className="text-[18px] text-black/70" />

          {isMounted && cartCount > 0 && (
            <span
              className="
        absolute -top-1 -right-1
        min-w-[18px] h-[18px] px-1
        rounded-full
        bg-black text-white
        text-[11px] leading-[18px] text-center
      "
            >
              {cartCount}
            </span>
          )}
        </div>

        {/* ✅ Fly-out Drawer */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-black/10 transition">
                <AvatarImage src={session.user.image || ""} alt="User Avatar" />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="
    w-56 rounded-2xl border border-black/5
    bg-white/90 backdrop-blur-xl
    shadow-[0_12px_30px_-22px_rgba(0,0,0,0.35)]
    p-2
  "
              align="end"
            >
              <div className="px-3 py-2">
                <div className="text-[12px] uppercase tracking-[0.22em] text-black/45">
                  Signed in as
                </div>
                <div className="mt-1 text-[13px] font-normal tracking-wide text-black/80">
                  {session.user.name}
                </div>
              </div>

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="
      mt-1 cursor-pointer rounded-xl
      px-3 py-2
      text-[13px] text-black/70
      hover:bg-black/5 hover:text-black
      transition
      flex items-center gap-2
    "
              >
                <IoMdExit className="text-[18px] text-black/60" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            onClick={() => router.push("/login")}
            className="
    cursor-pointer rounded-full
    border border-black/10 bg-white/70 backdrop-blur
    p-3
    transition
    hover:bg-white hover:border-black/20
    active:scale-[0.98]
  "
            title="Sign in"
          >
            <FaUser className="text-[18px] text-black/70" />
          </div>
        )}
      </div>
    </header>
  );
}
