// File: src/app/api/products/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // simulate fetch from DB or mock
  return NextResponse.json({ id });
}
