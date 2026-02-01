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
  const cartCount = state.items.reduce((t, i) => t + i.quantity, 0);
  const { data: session } = useSession();

  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setCartOpen] = useState(false);

  const indicatorRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const searchRef = useRef<HTMLFormElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setIsMounted(true), []);

  // Bounce cart icon เมื่อ cartCount เปลี่ยน
  useEffect(() => {
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
  }, [cartCount, isMounted]);

  // Desktop first-load anim
  useLayoutEffect(() => {
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

  // Mobile panel open anim
  useLayoutEffect(() => {
    if (!menuOpen || !mobilePanelRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mobilePanelRef.current,
        { opacity: 0, y: -10, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" },
      );
    });

    return () => ctx.revert();
  }, [menuOpen]);

  // Desktop indicator anim (เดิม)
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

    const currentX = gsap.getProperty(indicator, "x") as number;
    const goingRight = targetX > currentX;

    const overshoot = Math.min(18, Math.max(10, targetW * 0.12));
    const stretchW = Math.min(24, Math.max(12, targetW * 0.18));

    gsap.killTweensOf(indicator);

    const tl = gsap.timeline();
    tl.to(indicator, {
      x: targetX + (goingRight ? overshoot : -overshoot),
      width: targetW + stretchW,
      duration: 0.22,
      ease: "sine.out",
    });
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

  // ปิด mobile menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setMenuOpen(false);
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
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Top Row */}
        <div className="py-4 sm:py-6 flex items-center justify-between gap-3">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="block">
              <Image
                src="/Logo.png"
                alt="logo"
                width={160}
                height={80}
                className="h-auto w-[140px] sm:w-[160px] md:w-[180px]"
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div
              ref={navContainerRef}
              className="
                relative
                bg-white/80 backdrop-blur-sm
                rounded-full border border-gray-200
                flex items-center gap-2
                 py-1
                shadow-sm
              "
            >
              <div
                ref={indicatorRef}
                className="
                  absolute top-0 left-0 h-full
                  bg-black/70 rounded-full z-0 shadow-sm
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
                    className="
                      relative z-10
                      px-5 py-2
                      rounded-full
                      text-[12px] sm:text-[13px]
                      font-normal tracking-[0.18em]
                      transition-colors
                    "
                  >
                    <span
                      className={isActive ? "text-white" : "text-neutral-600"}
                    >
                      {nav.item}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              ref={searchRef}
              className="
                hidden lg:flex items-center rounded-full
                border border-black/10 bg-white/70 backdrop-blur
                px-4 py-2
                transition focus-within:border-black/25
              "
            >
              <FaSearch className="mr-2 text-[14px] text-black/50" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-44 bg-transparent outline-none
                  text-[13px] tracking-wide text-black/80
                  placeholder:text-black/35
                "
              />
            </form>

            {/* Cart (show both mobile+desktop) */}
            <div
              ref={cartRef}
              onClick={() => setCartOpen(true)}
              className="
                relative cursor-pointer rounded-full
                border border-black/10 bg-white/70 backdrop-blur
                p-3
                transition
                hover:bg-white hover:border-black/20
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
                    rounded-full bg-black text-white
                    text-[11px] leading-[18px] text-center
                  "
                >
                  {cartCount}
                </span>
              )}
            </div>

            {/* Desktop Avatar / Login */}
            <div className="hidden lg:block">
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer hover:ring-2 hover:ring-black/10 transition">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt="User Avatar"
                      />
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
                        px-3 py-2 text-[13px] text-black/70
                        hover:bg-black/5 hover:text-black
                        transition flex items-center gap-2
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

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="
                lg:hidden
                rounded-full
                border border-black/10 bg-white/70 backdrop-blur
                p-3
                transition
                hover:bg-white hover:border-black/20
                active:scale-[0.98]
              "
              aria-label="Open menu"
            >
              <span className="text-2xl text-black/70">
                {menuOpen ? <HiX /> : <HiMenuAlt3 />}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Panel */}
        {menuOpen && (
          <div
            ref={mobilePanelRef}
            className="
              lg:hidden
              pb-4
            "
          >
            <div
              className="
                rounded-2xl border border-black/5
                bg-white/80 backdrop-blur-xl
                shadow-[0_12px_30px_-22px_rgba(0,0,0,0.35)]
                p-4
              "
            >
              {/* Search on mobile */}
              <form
                onSubmit={handleSearch}
                className="
                  flex items-center rounded-full
                  border border-black/10 bg-white/70 backdrop-blur
                  px-4 py-2
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
                    w-full bg-transparent outline-none
                    text-[13px] tracking-wide text-black/80
                    placeholder:text-black/35
                  "
                />
              </form>

              {/* Nav list */}
              <nav className="mt-4 flex flex-col gap-2">
                {NavbarItem.map((nav) => {
                  const isActive = pathname === nav.href;
                  return (
                    <Link
                      key={nav.href}
                      href={nav.href}
                      onClick={() => setMenuOpen(false)}
                      className="
                        flex items-center justify-between
                        rounded-xl px-3 py-3
                        text-[13px] uppercase tracking-[0.18em]
                        transition
                        hover:bg-black/5
                      "
                    >
                      <span
                        className={isActive ? "text-black" : "text-black/70"}
                      >
                        {nav.item}
                      </span>
                      {isActive && (
                        <span className="text-[11px] tracking-[0.22em] text-black/45">
                          ACTIVE
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Auth row on mobile */}
              <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between">
                {session?.user ? (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={session.user.image || ""}
                        alt="User Avatar"
                      />
                      <AvatarFallback>
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-[13px] text-black/75">
                      {session.user.name}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/login");
                    }}
                    className="
                      rounded-full px-4 py-2
                      border border-black/10 bg-white/70
                      text-[12px] tracking-[0.18em] uppercase text-black/70
                      hover:bg-white hover:border-black/20 transition
                    "
                  >
                    Sign in
                  </button>
                )}

                {session?.user && (
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="
                      flex items-center gap-2
                      rounded-full px-4 py-2
                      border border-black/10 bg-white/70
                      text-[12px] tracking-[0.18em] uppercase text-black/70
                      hover:bg-white hover:border-black/20 transition
                    "
                  >
                    <IoMdExit className="text-[16px]" />
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
