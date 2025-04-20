import type { Metadata } from "next";
import "./globals.css";
import { Gotham } from "@/app/fonts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ClientProviders from "./ClientProviders";

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
          <main className="pt-4 flex-grow">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
