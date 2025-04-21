"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
import { motion } from "framer-motion";

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      {/* Logo */}
      <div className="flex items-center gap-1 text-xl font-semibold">
        <Link href="/">
          <Image src="/Logo.png" alt="logo" width={200} height={100} />
        </Link>
      </div>

      {/* Hamburger (Mobile only) */}
      <div className="lg:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl">
          {menuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden lg:flex items-center text-base">
        <div className="relative bg-white font-medium rounded-full flex items-center gap-2 px-1 py-1">
          {NavbarItem.map((nav) => {
            const isActive = pathname === nav.href;

            return (
              <Link
                key={nav.href}
                href={nav.href}
                className="relative px-6 py-2 flex items-center justify-center rounded-full text-sm font-medium transition-colors"
              >
                {/* Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 h-full w-full bg-black rounded-full z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Text */}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-white" : "text-black"
                  }`}
                >
                  {nav.item}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right Icons - Desktop */}
      <div className="hidden  lg:flex items-center gap-5">
        {/* Search */}
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

        {/* Cart */}
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

        {/* User */}
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

      {/* Mobile Menu Slide-down */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white z-50 shadow-md rounded-b-lg px-6 py-4 lg:hidden flex flex-col gap-4">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-100 rounded-full px-5 py-2"
          >
            <FaSearch className="mr-2 text-lg" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-base w-full"
            />
          </form>

          <ul className="flex flex-col font-medium gap-3 text-center">
            {NavbarItem.map((nav) => (
              <li key={nav.href}>
                <Link
                  href={nav.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 rounded-full ${
                    pathname === nav.href
                      ? "bg-black text-white"
                      : "hover:bg-gray-200 text-black"
                  }`}
                >
                  {nav.item}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex justify-center gap-4 pt-4">
            <Link href="/checkout" onClick={() => setMenuOpen(false)}>
              <div className="relative bg-gray-200 hover:bg-gray-300 p-3 rounded-full">
                <FaShoppingBag className="text-xl" />
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[14px] bg-red-500 text-white px-1.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {session?.user ? (
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setMenuOpen(false);
                }}
                className="bg-gray-200 rounded-full p-3 hover:bg-gray-300"
              >
                <IoMdExit className="text-xl" />
              </button>
            ) : (
              <div
                onClick={() => {
                  router.push("/login");
                  setMenuOpen(false);
                }}
                className="bg-gray-200 rounded-full p-3 cursor-pointer hover:bg-gray-300"
                title="Sign in"
              >
                <FaUser className="text-xl" />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
