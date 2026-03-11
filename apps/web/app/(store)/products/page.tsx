import ProductsPageClient from "../../components/ProductsPageClient";
import { getProductsData } from "../../lib/products-data";

type ProductsPageProps = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const products = await getProductsData();

  return (
    <ProductsPageClient
      initialProducts={products}
      initialSearch={params?.search ?? ""}
    />
  );
}
