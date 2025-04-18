import type { Metadata } from "next";
import "./globals.css";
import { Gotham } from "@/app/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "MinimalMart",
  description: "Minimal goods for maximal living",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${Gotham.variable}`}>
      <body className="min-h-screen font-gotham bg-white text-black ">
        <Header />
        <main className="pt-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
