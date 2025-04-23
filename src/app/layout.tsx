import type { Metadata } from "next";
import "./globals.css";
import { Gotham } from "@/app/fonts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ClientProviders from "./ClientProviders";
import PageTransitionWrapper from "@/components/PageTransitionWrapper";
import { Toaster } from "react-hot-toast"; // ✅ เพิ่มตรงนี้

export const metadata: Metadata = {
  title: "MinimalMart",
  description: "Minimal goods for maximal living",
  icons: {
    icon: "/favicon.png",
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
