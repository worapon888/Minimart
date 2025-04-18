import { NavItem } from "@/types/product";

export const HeroImage = [
  {
    img: "/hero_img1.avif",
    alt: "Sneaker in pastel tone",
    caption: "Live less, feel more.",
  },
  {
    img: "/hero_img2.avif",
    alt: "Classic watch on black background",
    caption: "Curated essentials for a simpler life.",
  },
  {
    img: "/hero_img3.avif",
    alt: "Fashionable man in yellow",
    caption: "Minimal goods for maximal living.",
  },
];

export const logos = [
  { name: "Swiss", image: "/logo/logo_thicker1_1.png" },
  { name: "Seiko", image: "/logo/logo_thicker2_2.png" },
  { name: "Polo", image: "/logo/logo_thicker3.png" },
  { name: "Shu", image: "/logo/logo_thicker4_4.png" },
  { name: "Vans", image: "/logo/logo_thicker5_5.png" },
  { name: "Nike", image: "/logo/logo_thicker6_6.png" },
  { name: "AIIZ", image: "/logo/logo_thicker7_7.png" },
];
export const FeatureProducts = [
  {
    name: "Nike Ryan Plomp",
    image: "/FeatureImage/FeatureImage_1.avif",
    price: 25.0,
    tag: "New",
  },
  {
    name: "Women Dress Green",
    image: "/FeatureImage/FeatureImage_2.avif",
    price: 15.99,
  },
  {
    name: "White Shirt",
    image: "/FeatureImage/FeatureImage_3.avif",
    price: 18.79,
  },
  {
    name: "Seiko Watch",
    image: "/FeatureImage/FeatureImage_4.avif",
    price: 39.59,
  },
];

export const categories = [
  { name: "Men", image: "/CategorisProducts/Categories_1.avif" },
  { name: "Women", image: "/CategorisProducts/Categories_2.avif" },
  { name: "Shoe", image: "/CategorisProducts/Categories_3.avif" },
  { name: "Kid’s", image: "/CategorisProducts/Categories_4.avif" },
  { name: "Watch", image: "/CategorisProducts/Categories_5.avif" },
  { name: "Jewelry", image: "/CategorisProducts/Categories_7.avif" },
];

export const NavbarItem: NavItem[] = [
  { item: "Home", href: "/" },
  { item: "Products", href: "/products" },
  { item: "About Us", href: "/about-us" },
  { item: "Contact", href: "/contact" },
];
