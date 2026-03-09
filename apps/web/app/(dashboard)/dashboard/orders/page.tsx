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

type OrderRow = {
  id: string;
  status: string;
  currency: string;
  subtotalCents: number;
  totalCents: number;
  itemCount: number;
  createdAt: string;
  paidAt: string | null;
  user: { id: string; email: string; name: string | null } | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/orders?limit=100&offset=0`, {
      cache: "no-store",
    });
    if (!res.ok) return [] as OrderRow[];
    const json = (await res.json().catch(() => ({}))) as { data?: OrderRow[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [] as OrderRow[];
  }
}

export default async function DashboardOrdersPage() {
  const rows = await fetchOrders();

  return (
    <div className="px-4 py-4 lg:px-6 md:py-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Paid At</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell>{row.user?.email ?? "-"}</TableCell>
                    <TableCell className="text-right">{row.itemCount}</TableCell>
                    <TableCell className="text-right">
                      {usdFormatter.format(row.totalCents / 100)}
                    </TableCell>
                    <TableCell>{row.paidAt ? new Date(row.paidAt).toLocaleString("en-US") : "-"}</TableCell>
                    <TableCell>{new Date(row.createdAt).toLocaleString("en-US")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found.
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
