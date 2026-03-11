import type { Product, ProductsResponse } from "../../../../packages/shared/types/product";

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
    const candidates: unknown[] = [];

    if (hasKey(json, "items") && Array.isArray(json.items))
      candidates.push(...json.items);
    else if (hasKey(json, "products") && Array.isArray(json.products))
      candidates.push(...json.products);
    else if (hasKey(json, "data") && Array.isArray(json.data))
      candidates.push(...json.data);

    return candidates.filter(isProduct);
  }

  return [];
};

function getApiBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:4000";

  return raw.replace("://localhost", "://127.0.0.1");
}

async function fetchWithLocalRetry(url: string): Promise<Response> {
  try {
    return await fetch(url, {
      next: { revalidate: 300 },
    });
  } catch (error) {
    const fallbackUrl = url.replace("://localhost", "://127.0.0.1");
    if (fallbackUrl === url) throw error;

    return fetch(fallbackUrl, {
      next: { revalidate: 300 },
    });
  }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetchWithLocalRetry(url);
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

export async function getProductsData(): Promise<Product[]> {
  const apiBase = getApiBaseUrl();

  try {
    const json = await fetchJSON<unknown>(`${apiBase}/products`);
    return normalizeProducts(json);
  } catch (error) {
    console.error("getProductsData error:", error);
    return [];
  }
}
