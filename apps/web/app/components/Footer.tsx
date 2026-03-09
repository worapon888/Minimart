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
  { icon: <MdEmail />, text: "Worapon@company.com" },
  { icon: <MdPhone />, text: "+66863699914" },
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
    <footer className="bg-neutral-50 text-neutral-800 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Logo + Social */}
          <div className="space-y-6">
            <Image src="/Logo.png" alt="logo" width={140} height={60} />

            <div className="flex items-center gap-3">
              {socialIcons.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={s.label}
                  title={s.label}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200 bg-white text-neutral-700
                             hover:bg-neutral-100 hover:text-neutral-900 transition"
                >
                  <span className="text-lg">{s.icon}</span>
                </button>
              ))}
            </div>

            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Minimal goods for maximal living. Curated essentials with a calm,
              clean experience.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              {footerLinks[0].links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-neutral-700 hover:text-neutral-900 transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              {footerLinks[1].links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-neutral-700 hover:text-neutral-900 transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Contact
            </h3>

            <ul className="space-y-3 text-sm">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span className="mt-0.5 text-neutral-500 text-lg">
                    {item.icon}
                  </span>
                  <span className="text-neutral-700 leading-relaxed">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* optional small note */}
            <p className="text-xs text-neutral-500">
              Available Mon–Fri, 10:00–18:00 (GMT+7)
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-neutral-500">
          <p>
            © 2025{" "}
            <span className="text-neutral-700 font-medium">Worapo.dev</span>.
            All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-neutral-800 transition">
              Terms
            </a>
            <span className="text-neutral-300">/</span>
            <a href="#" className="hover:text-neutral-800 transition">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
