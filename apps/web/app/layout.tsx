// apps/web/app/layout.tsx
import type { Metadata } from "next";
import { Gotham } from "@/app/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MinimalMart – Production-Style E-Commerce System",
    template: "%s | MinimalMart",
  },
  description:
    "A production-style e-commerce system built with Next.js 15, focused on real-world challenges such as flash-sale concurrency, inventory reservation, payment reliability, and scalable user experience.",
  keywords: [
    "ecommerce system",
    "full-stack project",
    "Next.js",
    "TypeScript",
    "production-ready",
    "flash sale",
    "inventory reservation",
    "payment reliability",
    "system design",
    "UX/UI",
  ],
  authors: [{ name: "Worapon.dev", url: "https://github.com/worapon888" }],
  creator: "Worapon.dev",
  metadataBase: new URL("https://minimart-three.vercel.app"),
  openGraph: {
    title: "MinimalMart – Production-Style E-Commerce System",
    description:
      "Built to explore real-world e-commerce architecture, including flash-sale concurrency, inventory reservation, payment flows, and production-focused frontend experience.",
    url: "https://minimart-three.vercel.app",
    siteName: "MinimalMart",
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 630,
        alt: "MinimalMart – Production-Style E-Commerce System",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinimalMart – Production-Style E-Commerce System",
    description:
      "A full-stack e-commerce project focused on real-world system behavior, payment reliability, and production-ready user experience.",
    images: ["/Logo.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={Gotham.variable} suppressHydrationWarning>
      <body className="min-h-screen font-gotham">{children}</body>
    </html>
  );
}
