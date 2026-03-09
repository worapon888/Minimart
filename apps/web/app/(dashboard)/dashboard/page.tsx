// Imports
import { ChartAreaInteractive } from "../../components/dashboard/chart-area-interactive";
import { DataTable } from "../../components/dashboard/data-table";
import { DemoDataControls } from "../../components/dashboard/demo-data-controls";
import { SectionCards } from "../../components/dashboard/section-cards";

// Types
type DailyRow = {
  date: string;
  grossCents: number;
  ordersCount: number;
  itemsSold: number;
};

type TopProductRow = {
  rank: number;
  qtySold: number;
  revenueCents: number;
  product: {
    id: string;
    title: string;
    priceCents: number;
    thumbnail: string | null;
    imageUrl: string | null;
  };
};

// Constants
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";
const SHOW_DEMO_CONTROLS =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_CONTROLS === "true";

// Helpers
function toYyyyMmDdUtc(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getLastDaysRange(days: number) {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { from: toYyyyMmDdUtc(from), to: toYyyyMmDdUtc(to) };
}

// Data
async function fetchDashboardData() {
  const { from, to } = getLastDaysRange(90);

  const [dailyRes, top30Res, top7Res] = await Promise.all([
    fetch(`${API_BASE}/dashboard/daily?from=${from}&to=${to}`, {
      cache: "no-store",
    }),
    fetch(`${API_BASE}/dashboard/top-products?window=D30&limit=50`, {
      cache: "no-store",
    }),
    fetch(`${API_BASE}/dashboard/top-products?window=D7&limit=50`, {
      cache: "no-store",
    }),
  ]);

  const [daily, top30, top7] = await Promise.all([
    dailyRes.ok ? ((await dailyRes.json()) as DailyRow[]) : [],
    top30Res.ok ? ((await top30Res.json()) as TopProductRow[]) : [],
    top7Res.ok ? ((await top7Res.json()) as TopProductRow[]) : [],
  ]);

  return { daily, top30, top7 };
}

// Page
export default async function Page() {
  const { daily, top30, top7 } = await fetchDashboardData();
  const totalRevenueCents = daily.reduce((sum, row) => sum + row.grossCents, 0);
  const totalOrders = daily.reduce((sum, row) => sum + row.ordersCount, 0);
  const totalItems = daily.reduce((sum, row) => sum + row.itemsSold, 0);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {SHOW_DEMO_CONTROLS ? <DemoDataControls /> : null}
      <SectionCards
        totalRevenueCents={totalRevenueCents}
        totalOrders={totalOrders}
        totalItems={totalItems}
        topProductsCount={top30.length}
      />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={daily} />
      </div>
      <DataTable daily={daily} top30={top30} top7={top7} />
    </div>
  );
}
