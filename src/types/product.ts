export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;

  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;

  tags: string[];

  brand?: string; // ✅ optional
  sku?: string; // ✅ optional

  weight: number;

  dimensions: {
    width: number;
    height: number;
    depth: number;
  };

  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;

  reviews: Review[];

  returnPolicy: string;
  minimumOrderQuantity: number;

  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };

  images: string[];
  thumbnail: string;
};

export type Review = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type NavItem = {
  item: string;
  href: string;
};

export type Category = string;

export type FeaturedProduct = {
  id: number;
  title: string;
  price: number;
  image: string | null; // กัน empty string
  category: string;
  tag?: string;
};

export type CategoryProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string | null; // ✅ กัน empty string
  ratingValue: number; // 0..5
  ratingCount?: number;
  tag?: string;
};
export type CartItemLike = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  // ของคุณอาจมี field พวกนี้ (มาจาก Product dummyjson)
  thumbnail?: string;
  images?: string[];
  // เผื่อบางจุดยังมี image เดี่ยว
  image?: string | null;
};
