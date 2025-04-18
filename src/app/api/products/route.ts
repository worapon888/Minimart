// app/api/products/route.ts
import { NextResponse } from "next/server";

const products = [
  {
    id: "1",
    name: "T-Shirt Black Minimalist",
    price: 28.09,
    description: "Soft-touch cotton tee with timeless minimalist print.",
    sizes: ["S", "M", "L", "XL", "2XL"],
    images: ["/1.jpg", "/2.jpg"],
  },
];

export async function GET() {
  return NextResponse.json(products);
}
