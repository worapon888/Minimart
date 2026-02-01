import type { Metadata } from "next";
import { Gotham } from "@/app/fonts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ClientProviders from "./ClientProviders";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Toaster } from "react-hot-toast";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "MinimalMart – Motion-first E-commerce",
    template: "%s | MinimalMart",
  },
  description:
    "A beautifully crafted motion-enhanced e-commerce experience built with Next.js 15 + GSAP.",
  keywords: [
    "ecommerce",
    "frontend",
    "motion ui",
    "GSAP",
    "Next.js",
    "Tailwind CSS",
    "UX/UI",
  ],
  authors: [{ name: "Worapon.dev", url: "https://github.com/yourgithub" }],
  creator: "Code404",
  metadataBase: new URL("https://minimart-three.vercel.app"),
  openGraph: {
    title: "MinimalMart – Motion-first E-commerce",
    description:
      "Clean UI, GSAP animation, and real-time filtering – built for the modern shopper.",
    url: "https://minimart-three.vercel.app",
    siteName: "MinimalMart",
    images: [
      {
        url: "/Logo.png", // วางใน public folder
        width: 1200,
        height: 630,
        alt: "MinimalMart – Premium Motion UI Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinimalMart – Motion-first E-commerce",
    description:
      "Experience smooth interactions and beautiful design powered by GSAP + Next.js.",
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
    <html lang="en" className={`${Gotham.variable}`}>
      <body className="min-h-screen flex flex-col font-gotham">
        <SmoothScroll />
        <ClientProviders>
          <Header />

          <PageTransitionWrapper>
            <main className="flex-grow">{children}</main>
          </PageTransitionWrapper>

          <Footer />
        </ClientProviders>

        {/* ✅ เพิ่ม Toaster ตรงนี้ */}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
