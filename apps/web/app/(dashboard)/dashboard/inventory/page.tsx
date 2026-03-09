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

type InventoryRow = {
  id: string;
  sku: string;
  title: string;
  category: string | null;
  status: string;
  onHand: number;
  reserved: number;
  available: number;
  flashStock: number;
  flashReserved: number;
  flashSold: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

async function fetchInventory() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/inventory?limit=100&offset=0`, {
      cache: "no-store",
    });
    if (!res.ok) return [] as InventoryRow[];
    const json = (await res.json().catch(() => ({}))) as { data?: InventoryRow[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [] as InventoryRow[];
  }
}

export default async function DashboardInventoryPage() {
  const rows = await fetchInventory();

  return (
    <div className="px-4 py-4 lg:px-6 md:py-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Flash Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.onHand}</TableCell>
                    <TableCell className="text-right">{row.reserved}</TableCell>
                    <TableCell className="text-right">{row.available}</TableCell>
                    <TableCell className="text-right">{row.flashSold}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No inventory data found.
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
