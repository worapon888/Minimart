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
        235 bangkea
        <br />
        bangkok thailand, 10160
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
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        {/* Logo & Social */}
        <div className="space-y-6 col-span-1 md:col-span-1">
          <Image src="/logo.png" alt="logo" width={200} height={100} />
          <div className="flex gap-4 text-xl">
            {socialIcons.map((s, i) => {
              const iconColor =
                s.label === "Facebook"
                  ? "text-blue-600"
                  : s.label === "Twitter"
                  ? "text-black"
                  : "text-gray-800";

              return (
                <span
                  key={i}
                  className={`text-2xl transition cursor-pointer hover:opacity-80 ${iconColor}`}
                  title={s.label}
                >
                  {s.icon}
                </span>
              );
            })}
          </div>
        </div>

        {/* Footer Link Groups */}
        {footerLinks.map((group) => (
          <div key={group.title}>
            <h3 className="font-medium text-lg mb-4">{group.title}</h3>
            <ul className="space-y-3 text-sm">
              {group.links.map((link) => (
                <li key={link} className="hover:underline cursor-pointer">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact Info */}
        <div>
          <h3 className="font-medium text-lg mb-4">Contacts us</h3>
          <ul className="space-y-3 text-sm">
            {contactInfo.map((item, index) => (
              <li key={index} className="flex items-start gap-2 ">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-gray-100 py-4 text-center text-sm px-6">
        <p>
          Copyright © 2025 <strong>Code_404</strong> | All Rights Reserved |{" "}
          <a href="#" className="text-indigo-600 hover:underline">
            Terms and Conditions
          </a>{" "}
          |{" "}
          <a href="#" className="text-indigo-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </footer>
  );
}
