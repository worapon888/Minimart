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

type CustomerRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  ordersCount: number;
  paidOrdersCount: number;
  totalSpentCents: number;
  lastOrderAt: string | null;
  createdAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function fetchCustomers() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/customers?limit=100&offset=0`, {
      cache: "no-store",
    });
    if (!res.ok) return [] as CustomerRow[];
    const json = (await res.json().catch(() => ({}))) as { data?: CustomerRow[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [] as CustomerRow[];
  }
}

export default async function DashboardCustomersPage() {
  const rows = await fetchCustomers();

  return (
    <div className="px-4 py-4 lg:px-6 md:py-6">
      <Card>
        <CardHeader>
          <CardTitle>Customers ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Paid Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.name ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.ordersCount}</TableCell>
                    <TableCell className="text-right">{row.paidOrdersCount}</TableCell>
                    <TableCell className="text-right">
                      {usdFormatter.format(row.totalSpentCents / 100)}
                    </TableCell>
                    <TableCell>
                      {row.lastOrderAt ? new Date(row.lastOrderAt).toLocaleString("en-US") : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No customers found.
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
