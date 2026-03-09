"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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

type TopSortKey = "rank" | "title" | "qtySold" | "revenueCents" | "priceCents";
type DailySortKey = "date" | "ordersCount" | "itemsSold" | "grossCents";
type SortDir = "asc" | "desc";
type View = "top30" | "top7" | "daily";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const intFormatter = new Intl.NumberFormat("en-US");

function nextSort<T extends string>(
  current: { key: T; dir: SortDir },
  key: T,
): { key: T; dir: SortDir } {
  if (current.key !== key) return { key, dir: "desc" };
  return { key, dir: current.dir === "desc" ? "asc" : "desc" };
}

function sortTopRows(
  rows: TopProductRow[],
  sort: { key: TopSortKey; dir: SortDir },
) {
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "rank":
        return (a.rank - b.rank) * sign;
      case "title":
        return a.product.title.localeCompare(b.product.title) * sign;
      case "qtySold":
        return (a.qtySold - b.qtySold) * sign;
      case "revenueCents":
        return (a.revenueCents - b.revenueCents) * sign;
      case "priceCents":
        return (a.product.priceCents - b.product.priceCents) * sign;
    }
  });
}

function sortDailyRows(rows: DailyRow[], sort: { key: DailySortKey; dir: SortDir }) {
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "date":
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * sign;
      case "ordersCount":
        return (a.ordersCount - b.ordersCount) * sign;
      case "itemsSold":
        return (a.itemsSold - b.itemsSold) * sign;
      case "grossCents":
        return (a.grossCents - b.grossCents) * sign;
    }
  });
}

function SortButton({
  onClick,
  active,
  dir,
  children,
}: {
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      className="h-8 px-2 text-left"
      onClick={onClick}
    >
      {children}
      {active ? (
        <span className="text-muted-foreground text-xs">{dir === "desc" ? "↓" : "↑"}</span>
      ) : (
        <IconChevronDown className="text-muted-foreground size-3" />
      )}
    </Button>
  );
}

export function DataTable({
  top30,
  top7,
  daily,
}: {
  top30: TopProductRow[];
  top7: TopProductRow[];
  daily: DailyRow[];
}) {
  const [view, setView] = React.useState<View>("top30");
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [topSort, setTopSort] = React.useState<{ key: TopSortKey; dir: SortDir }>({
    key: "revenueCents",
    dir: "desc",
  });
  const [dailySort, setDailySort] = React.useState<{ key: DailySortKey; dir: SortDir }>({
    key: "date",
    dir: "desc",
  });

  React.useEffect(() => {
    setPage(1);
  }, [view, query, pageSize]);

  const filteredTop30 = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? top30.filter(
          (r) =>
            r.product.title.toLowerCase().includes(q) ||
            r.product.id.toLowerCase().includes(q),
        )
      : top30;
    return sortTopRows(rows, topSort);
  }, [query, top30, topSort]);

  const filteredTop7 = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? top7.filter(
          (r) =>
            r.product.title.toLowerCase().includes(q) ||
            r.product.id.toLowerCase().includes(q),
        )
      : top7;
    return sortTopRows(rows, topSort);
  }, [query, top7, topSort]);

  const filteredDaily = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? daily.filter((r) => r.date.slice(0, 10).toLowerCase().includes(q))
      : daily;
    return sortDailyRows(rows, dailySort);
  }, [daily, dailySort, query]);

  const activeRows =
    view === "top30" ? filteredTop30 : view === "top7" ? filteredTop7 : filteredDaily;
  const pageCount = Math.max(1, Math.ceil(activeRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pagedTop30 = filteredTop30.slice(start, start + pageSize);
  const pagedTop7 = filteredTop7.slice(start, start + pageSize);
  const pagedDaily = filteredDaily.slice(start, start + pageSize);

  return (
    <Tabs
      value={view}
      onValueChange={(v) => setView(v as View)}
      className="w-full flex-col justify-start gap-4"
    >
      <div className="flex flex-col gap-3 px-4 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select value={view} onValueChange={(v) => setView(v as View)}>
            <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top30">Top Products (D30)</SelectItem>
              <SelectItem value="top7">Top Products (D7)</SelectItem>
              <SelectItem value="daily">Daily Sales (90d)</SelectItem>
            </SelectContent>
          </Select>

          <TabsList className="hidden @4xl/main:flex">
            <TabsTrigger value="top30">Top Products (D30)</TabsTrigger>
            <TabsTrigger value="top7">Top Products (D7)</TabsTrigger>
            <TabsTrigger value="daily">Daily Sales (90d)</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              view === "daily" ? "Search by date (YYYY-MM-DD)" : "Search product title or ID"
            }
            className="h-8 w-full max-w-xs"
          />
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm">
              Rows per page
            </Label>
            <Select value={`${pageSize}`} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 50].map((n) => (
                  <SelectItem key={n} value={`${n}`}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <TabsContent value="top30" className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "rank"))}
                    active={topSort.key === "rank"}
                    dir={topSort.dir}
                  >
                    Rank
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "title"))}
                    active={topSort.key === "title"}
                    dir={topSort.dir}
                  >
                    Product
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "qtySold"))}
                    active={topSort.key === "qtySold"}
                    dir={topSort.dir}
                  >
                    Qty Sold
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "revenueCents"))}
                    active={topSort.key === "revenueCents"}
                    dir={topSort.dir}
                  >
                    Revenue
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "priceCents"))}
                    active={topSort.key === "priceCents"}
                    dir={topSort.dir}
                  >
                    Unit Price
                  </SortButton>
                </TableHead>
                <TableHead>Product ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedTop30.length > 0 ? (
                pagedTop30.map((row) => (
                  <TableRow key={`${row.product.id}-d30`}>
                    <TableCell>{row.rank}</TableCell>
                    <TableCell className="font-medium">{row.product.title}</TableCell>
                    <TableCell className="text-right">{intFormatter.format(row.qtySold)}</TableCell>
                    <TableCell className="text-right">
                      {usdFormatter.format(row.revenueCents / 100)}
                    </TableCell>
                    <TableCell className="text-right">
                      {usdFormatter.format(row.product.priceCents / 100)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.product.id}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No top products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="top7" className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "rank"))}
                    active={topSort.key === "rank"}
                    dir={topSort.dir}
                  >
                    Rank
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "title"))}
                    active={topSort.key === "title"}
                    dir={topSort.dir}
                  >
                    Product
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "qtySold"))}
                    active={topSort.key === "qtySold"}
                    dir={topSort.dir}
                  >
                    Qty Sold
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "revenueCents"))}
                    active={topSort.key === "revenueCents"}
                    dir={topSort.dir}
                  >
                    Revenue
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setTopSort((s) => nextSort(s, "priceCents"))}
                    active={topSort.key === "priceCents"}
                    dir={topSort.dir}
                  >
                    Unit Price
                  </SortButton>
                </TableHead>
                <TableHead>Product ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedTop7.length > 0 ? (
                pagedTop7.map((row) => (
                  <TableRow key={`${row.product.id}-d7`}>
                    <TableCell>{row.rank}</TableCell>
                    <TableCell className="font-medium">{row.product.title}</TableCell>
                    <TableCell className="text-right">{intFormatter.format(row.qtySold)}</TableCell>
                    <TableCell className="text-right">
                      {usdFormatter.format(row.revenueCents / 100)}
                    </TableCell>
                    <TableCell className="text-right">
                      {usdFormatter.format(row.product.priceCents / 100)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.product.id}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No top products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="daily" className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <SortButton
                    onClick={() => setDailySort((s) => nextSort(s, "date"))}
                    active={dailySort.key === "date"}
                    dir={dailySort.dir}
                  >
                    Date
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setDailySort((s) => nextSort(s, "ordersCount"))}
                    active={dailySort.key === "ordersCount"}
                    dir={dailySort.dir}
                  >
                    Orders
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setDailySort((s) => nextSort(s, "itemsSold"))}
                    active={dailySort.key === "itemsSold"}
                    dir={dailySort.dir}
                  >
                    Items Sold
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    onClick={() => setDailySort((s) => nextSort(s, "grossCents"))}
                    active={dailySort.key === "grossCents"}
                    dir={dailySort.dir}
                  >
                    Revenue
                  </SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedDaily.length > 0 ? (
                pagedDaily.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">{row.date.slice(0, 10)}</TableCell>
                    <TableCell className="text-right">{intFormatter.format(row.ordersCount)}</TableCell>
                    <TableCell className="text-right">{intFormatter.format(row.itemsSold)}</TableCell>
                    <TableCell className="text-right">
                      {usdFormatter.format(row.grossCents / 100)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No daily sales records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="text-muted-foreground text-sm">
          {activeRows.length === 0
            ? "0 results"
            : `Showing ${start + 1}-${Math.min(start + pageSize, activeRows.length)} of ${activeRows.length}`}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm">
            Page {safePage} of {pageCount}
          </div>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => setPage(1)}
            disabled={safePage <= 1}
          >
            <IconChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage >= pageCount}
          >
            <IconChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => setPage(pageCount)}
            disabled={safePage >= pageCount}
          >
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </Tabs>
  );
}
