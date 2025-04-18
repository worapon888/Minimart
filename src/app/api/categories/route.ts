// src/app/api/categories/route.ts
import { products } from "@/data/products";

export async function GET() {
  // สร้าง category ไม่ซ้ำ พร้อมรูปแรกที่เจอในหมวดนั้น
  const categoriesMap = new Map();

  for (const item of products) {
    if (!categoriesMap.has(item.category)) {
      categoriesMap.set(item.category, item.image);
    }
  }

  const categories = Array.from(categoriesMap.entries()).map(
    ([category, image]) => ({
      category,
      image,
    })
  );

  return Response.json(categories);
}
