export type Product = {
  id: string;
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
  id: string; // ✅ BN/Prisma: cuid string
  title: string;
  price: number; // USD
  description: string;
  category: string;
  image: string | null;
  ratingValue: number; // 0..5
  ratingCount?: number;
  tag?: string;
};

export type CartItemLike = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  images?: string[];
  image?: string | null;
};
export type ProductsResponse = {
  ok: boolean;
  data: Product[];
  meta?: unknown;
};
// ✅ DTO ที่ตรงกับ Prisma Product ฝั่ง BN (ตาม schema ที่คุณส่งมา)
export type ApiProduct = {
  id: string;
  sku: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  currency: string;

  status: "ACTIVE" | "DRAFT" | "ARCHIVED";

  availabilityStatus: string | null;
  brand: string | null;
  category: string | null;
  discountPercentage: number | null;
  images: string[];
  minimumOrderQuantity: number | null;
  rating: number | null;
  returnPolicy: string | null;
  shippingInformation: string | null;
  tags: string[];
  thumbnail: string | null;
  warrantyInformation: string | null;
  weight: number | null;
};

// API อาจคืนได้ 2 แบบ
export type ApiProductsResponse = ApiProduct[] | { data: ApiProduct[] };
