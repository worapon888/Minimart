"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  // const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const indicatorRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
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
    <header className="container mx-auto py-6 px-6 flex items-center justify-between w-full relative">
      <div className="flex items-center gap-1 text-xl font-semibold">
        <Link href="/">
          <Image src="/Logo.png" alt="logo" width={200} height={100} />
        </Link>
      </div>

      <div className="lg:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl">
          {menuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

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
                <span className={`${isActive ? "text-white" : "text-black"}`}>
                  {nav.item}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right Icons - Desktop */}
      <div className="hidden  lg:flex items-center gap-5">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white rounded-full px-5 py-2"
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

        <Link href="/checkout">
          <div className="relative bg-gray-200 hover:bg-gray-300 rounded-full p-3 cursor-pointer transition">
            <FaShoppingBag className="text-xl" />
            {isMounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[14px] bg-red-500 text-white px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>
        </Link>

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
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
            className="bg-gray-200 rounded-full p-3 cursor-pointer hover:bg-gray-300 transition duration-300"
            title="Sign in"
          >
            <FaUser className="text-xl" />
          </div>
        )}
      </div>
    </header>
  );
}
