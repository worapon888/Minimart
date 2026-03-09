// apps/web/app/(store)/layout.tsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClientProviders from "../ClientProviders";
import PageTransitionWrapper from "../components/PageTransitionWrapper";
import SmoothScroll from "../components/SmoothScroll";
import { Toaster } from "react-hot-toast";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SmoothScroll />

      <ClientProviders>
        <Header />

        <PageTransitionWrapper>
          <main className="flex-grow">{children}</main>
        </PageTransitionWrapper>

        <Footer />
      </ClientProviders>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
