import type { Metadata } from "next";
import "./globals.css";
import { Gotham } from "@/app/fonts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ClientProviders from "./ClientProviders";
import PageTransitionWrapper from "@/components/PageTransitionWrapper"; // ✅ Import ที่นี่

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
      <body className="min-h-screen flex flex-col font-gotham">
        <ClientProviders>
          <Header />

          {/* ✅ Wrap ด้วย PageTransitionWrapper */}
          <PageTransitionWrapper>
            <main className=" flex-grow">{children}</main>
          </PageTransitionWrapper>

          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
