import type { Product, ProductsResponse } from "../../../../packages/shared/types/product";
import { getPriceUSD } from "../../../../packages/shared/utils/price";

export type FeaturedProductUI = {
  id: string;
  title: string;
  price: number;
  image: string | null;
  category: string;
  tag?: string;
  hasPrice: boolean;
};

export type CategoryCard = {
  category: string;
  image: string | null;
};

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

const hasKey = <K extends string>(
  obj: Record<string, unknown>,
  key: K,
): obj is Record<K, unknown> => key in obj;

const isProductsResponse = (x: unknown): x is ProductsResponse => {
  if (!isObject(x)) return false;
  if (!hasKey(x, "data")) return false;
  return Array.isArray(x.data);
};

const isProduct = (x: unknown): x is Product => {
  if (!isObject(x)) return false;
  return (
    hasKey(x, "id") &&
    typeof x.id === "string" &&
    hasKey(x, "title") &&
    typeof x.title === "string"
  );
};

const normalizeProducts = (json: unknown): Product[] => {
  if (Array.isArray(json)) return json.filter(isProduct);
  if (isProductsResponse(json)) return json.data.filter(isProduct);

  if (isObject(json)) {
    if (hasKey(json, "items") && Array.isArray(json.items))
      return json.items.filter(isProduct);
    if (hasKey(json, "products") && Array.isArray(json.products))
      return json.products.filter(isProduct);
    if (hasKey(json, "data") && Array.isArray(json.data))
      return json.data.filter(isProduct);
  }

  return [];
};

const getImageSrc = (p: Product): string | null => {
  if (isObject(p) && "imageUrl" in p) {
    const v = p.imageUrl;
    if (typeof v === "string" && v.trim()) return v;
  }

  if (typeof p.thumbnail === "string" && p.thumbnail.trim()) return p.thumbnail;

  if (Array.isArray(p.images)) {
    const first = p.images[0];
    if (typeof first === "string" && first.trim()) return first;
  }

  return null;
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 300 },
  });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Response is not JSON: ${text.slice(0, 200)}`);
  }
}

export async function getHomePageData(): Promise<{
  featured: FeaturedProductUI[];
  categories: CategoryCard[];
}> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  try {
    const json = await fetchJSON<unknown>(`${apiBase}/products`);
    const products = normalizeProducts(json);

    const featured = products.slice(0, 4).map((item) => {
      const parsed = getPriceUSD(item);

      return {
        id: item.id,
        title: item.title,
        price: parsed ?? 0,
        image: getImageSrc(item),
        category: item.category,
        tag: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags[0] : undefined,
        hasPrice: parsed !== null,
      };
    });

    const categoryMap = new Map<string, string | null>();

    for (const product of products) {
      const key = typeof product.category === "string" ? product.category.trim() : "";
      if (!key || categoryMap.has(key)) continue;
      categoryMap.set(key, getImageSrc(product));
    }

    const categories = Array.from(categoryMap.entries())
      .map(([category, image]) => ({ category, image }))
      .sort((a, b) => a.category.localeCompare(b.category));

    return { featured, categories };
  } catch (error) {
    console.error("getHomePageData error:", error);
    return { featured: [], categories: [] };
  }
}
