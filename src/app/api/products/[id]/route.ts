// app/api/products/[id]/route.ts
import { products } from "@/data/products";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: { id: string } }) {
  const product = products.find((p) => p.id === parseInt(context.params.id));
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}
