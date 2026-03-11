import CategoriesProducts from "../components/CategoreisProducts";
import FeaturesProducts from "../components/FeaturesProducts";
import HeroSection from "../components/HeroSection";
import LogoTicker from "../components/LogoTicker";
import WhyMinimalMart from "../components/WhyMinimalMart";
import { getHomePageData } from "../lib/home-page-data";

export default async function HomePage() {
  const { categories, featured } = await getHomePageData();

  return (
    <section className="w-full py-10 container">
      <HeroSection />
      <LogoTicker />
      <FeaturesProducts initialProducts={featured} />
      <CategoriesProducts initialCategories={categories} />
      <WhyMinimalMart />
    </section>
  );
}
