import { ProductsManager } from "../../../components/dashboard/products-manager";

type Product = {
  id: string;
  sku: string;
  title: string;
  category: string | null;
  priceCents: number;
  stock?: number;
  thumbnail: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products?limit=100&offset=0`, {
      cache: "no-store",
    });
    if (!res.ok) return [] as Product[];

    const json = (await res.json().catch(() => ({}))) as { data?: Product[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [] as Product[];
  }
}

export default async function DashboardProductsPage() {
  const initialProducts = await fetchProducts();

  return (
    <div className="py-4 md:py-6">
      <ProductsManager initialProducts={initialProducts} />
    </div>
  );
}
