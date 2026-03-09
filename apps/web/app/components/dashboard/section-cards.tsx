import { IconPackage, IconReceiptDollar, IconShoppingCart } from "@tabler/icons-react";

import { Badge } from "./ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type SectionCardsProps = {
  totalRevenueCents: number;
  totalOrders: number;
  totalItems: number;
  topProductsCount: number;
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const intFormatter = new Intl.NumberFormat("en-US");

export function SectionCards({
  totalRevenueCents,
  totalOrders,
  totalItems,
  topProductsCount,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Revenue (90d)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {usdFormatter.format(totalRevenueCents / 100)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Live</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          Sum of paid orders in the selected 90-day range
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Total Orders (90d)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {intFormatter.format(totalOrders)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconShoppingCart className="size-4" />
              Orders
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          Count of orders with status PAID
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Items Sold (90d)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {intFormatter.format(totalItems)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage className="size-4" />
              Items
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          Total quantity sold from paid orders
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Top Products (D30)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {intFormatter.format(topProductsCount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconReceiptDollar className="size-4" />
              Ranked
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          Products in current 30-day ranking table
        </CardFooter>
      </Card>
    </div>
  );
}
