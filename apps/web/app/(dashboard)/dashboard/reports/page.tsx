import { Badge } from "../../../components/dashboard/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/dashboard/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/dashboard/ui/table";

type DailyRow = {
  date: string;
  grossCents: number;
  ordersCount: number;
  itemsSold: number;
};

type TopRow = {
  rank: number;
  qtySold: number;
  revenueCents: number;
  product: { id: string; title: string };
};

type ReportSummary = {
  ok?: boolean;
  data?: {
    days: number;
    totals: {
      revenueCents: number;
      orders: number;
      items: number;
      avgOrderValueCents: number;
    };
    daily: DailyRow[];
    topProducts: TopRow[];
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function fetchSummary() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/reports/summary?days=30`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => ({}))) as ReportSummary;
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardReportsPage() {
  const report = await fetchSummary();

  return (
    <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 md:py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {usdFormatter.format((report?.totals.revenueCents ?? 0) / 100)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Orders (30d)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {report?.totals.orders ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Items Sold (30d)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {report?.totals.items ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {usdFormatter.format((report?.totals.avgOrderValueCents ?? 0) / 100)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.topProducts?.length ? (
                report.topProducts.map((row) => (
                  <TableRow key={`${row.product.id}-${row.rank}`}>
                    <TableCell>
                      <Badge variant="outline">#{row.rank}</Badge>
                    </TableCell>
                    <TableCell>{row.product.title}</TableCell>
                    <TableCell className="text-right">{row.qtySold}</TableCell>
                    <TableCell className="text-right">
                      {usdFormatter.format(row.revenueCents / 100)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No report data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
