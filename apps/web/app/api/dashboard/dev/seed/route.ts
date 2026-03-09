import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { count?: number };

    const res = await fetch(`${API_BASE}/dashboard/dev/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: body.count ?? 2 }),
      cache: "no-store",
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "Failed to reach API",
      },
      { status: 500 },
    );
  }
}
