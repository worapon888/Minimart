"use client";

import Image from "next/image";
import { FaSearch, FaShoppingBag, FaUser } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";
import { NavbarItem } from "../../data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { IoMdExit } from "react-icons/io";

export default function Header() {
  const pathname = usePathname();
  const { state } = useCart();
  const cartCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query.length > 1) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="container mx-auto py-6 px-6 flex items-center justify-between w-full">
      {/* Logo */}
      <div className="flex items-center gap-1 text-xl font-semibold">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={200} height={100} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex items-center text-base">
        <ul className="bg-white font-medium rounded-4xl flex items-center py-2 gap-2">
          {NavbarItem.map((nav) => {
            const isActive = pathname === nav.href;

            return (
              <li key={nav.href}>
                <Link
                  href={nav.href}
                  className={`px-6 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-black text-white font-medium"
                      : "text-black hover:bg-zinc-200"
                  }`}
                >
                  {nav.item}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Search + Icons */}
      <div className="flex items-center justify-center gap-5">
        {/* Search bar */}
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

        {/* Cart icon with badge */}
        <Link href="/checkout">
          <div className="relative bg-gray-200 hover:bg-gray-300  transition duration-200 rounded-full p-3 cursor-pointer">
            <FaShoppingBag className="text-xl" />
            {isMounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[14px] bg-red-500 text-white px-1.5 rounded-[100%]">
                {cartCount}
              </span>
            )}
          </div>
        </Link>
        {/* User icon */}
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
              <div className="px-3 py-1.5 text-[15px] tracking-widest font-medium ">
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
