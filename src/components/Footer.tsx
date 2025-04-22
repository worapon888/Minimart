"use client";

import Image from "next/image";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Case studies", "Reviews", "Updates"],
  },
  {
    title: "Company",
    links: ["About", "Contact us", "Careers", "Culture", "Blog"],
  },
  {
    title: "Support",
    links: [
      "Getting started",
      "Help center",
      "Server status",
      "Report a bug",
      "Chat support",
    ],
  },
];

const contactInfo = [
  {
    icon: <MdEmail />,
    text: "Worapon@company.com",
  },
  {
    icon: <MdPhone />,
    text: "+66863699914",
  },
  {
    icon: <MdLocationOn />,
    text: (
      <>
        235 Bangkhae,
        <br /> Bangkok, Thailand 10160
      </>
    ),
  },
];

const socialIcons = [
  { icon: <FaFacebook />, label: "Facebook" },
  { icon: <FaXTwitter />, label: "Twitter" },
  { icon: <FaInstagram />, label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="bg-[#DCDBDB] text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Logo + Social */}
        <div className="space-y-6">
          <Image src="/Logo.png" alt="logo" width={160} height={80} />
          <div className="flex gap-4">
            {socialIcons.map((s, i) => (
              <span
                key={i}
                className="text-2xl hover:scale-110 hover:opacity-80 transition-transform"
                title={s.label}
              >
                {s.icon}
              </span>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            {footerLinks[0].links.map((link) => (
              <li key={link} className="hover:underline cursor-pointer">
                {link}
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            {footerLinks[1].links.map((link) => (
              <li key={link} className="hover:underline cursor-pointer">
                {link}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact (รวม Support ไว้ด้วยถ้าจะแน่นมากไป) */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            {contactInfo.map((item, index) => (
              <li key={index} className="flex gap-3 items-start">
                <span className="text-xl mt-1">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gray-100 py-5 text-center text-sm px-6">
        <p>
          &copy; 2025 <strong>Code_404</strong> | All Rights Reserved |
          <a href="#" className="text-indigo-600 hover:underline mx-1">
            Terms
          </a>{" "}
          |
          <a href="#" className="text-indigo-600 hover:underline mx-1">
            Privacy
          </a>
        </p>
      </div>
    </footer>
  );
}
