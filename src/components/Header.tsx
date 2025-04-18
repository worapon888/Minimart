"use client";

import Image from "next/image";
import { useState } from "react";
import { FaSearch, FaShoppingBag, FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NavbarItem = [
  { item: "Home", href: "/" },
  { item: "Products", href: "/products" },
  { item: "About Us", href: "/about-us" },
  { item: "Contact", href: "/contact" },
];

export default function Header() {
  const [cartCount, setCartCount] = useState(4);
  const pathname = usePathname();

  return (
    <header className="container mx-auto py-6 px-6 flex items-center justify-between w-full">
      {/* Logo */}
      <div className="flex items-center gap-1 text-xl font-semibold">
        <Link href="/">
          {" "}
          <Image src="/logo.png" alt="logo" width={200} height={100} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex items-center text-base">
        <ul className="bg-white font-medium rounded-4xl flex items-center py-2">
          {NavbarItem.map((nav) => {
            const isActive = pathname === nav.href;

            return (
              <li key={nav.href}>
                <Link
                  href={nav.href}
                  className={`px-8 py-3 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#4D4D4D] text-white font-medium"
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
      <div className="flex items-center justify-center gap-5 ">
        {/* Search bar */}
        <div className="flex items-center bg-white rounded-full px-5 py-2">
          <FaSearch className="mr-2 text-lg" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-base font-normal"
          />
        </div>

        {/* Cart icon with badge */}
        <div className="relative bg-gray-200 rounded-full p-3 cursor-pointer">
          <FaShoppingBag className="text-xl" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1.5 rounded-full">
              {cartCount}
            </span>
          )}
        </div>

        {/* User icon */}
        <div className="bg-gray-200 rounded-full p-3 cursor-pointer">
          <FaUser className="text-xl" />
        </div>
      </div>
    </header>
  );
}
