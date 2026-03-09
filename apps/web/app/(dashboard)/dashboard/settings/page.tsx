import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/dashboard/ui/card";
import { Button } from "../../../components/dashboard/ui/button";

export default function DashboardSettingsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 md:py-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Settings</CardTitle>
          <CardDescription>
            Manage dashboard behavior and quick admin actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Overview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/products">Manage Products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/reports">Open Reports</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
