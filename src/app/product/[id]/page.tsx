"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/product";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`/api/products`)
      .then((res) => res.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.id === id);
        setProduct(found || null);
      });
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="mt-2 text-gray-600">{product.description}</p>
      <p className="mt-4 text-lg font-semibold">${product.price}</p>
    </div>
  );
}
