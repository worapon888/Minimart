// Imports
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ActiveThemeProvider } from "../../components/dashboard/active-theme";
import { AppSidebar } from "../../components/dashboard/app-sidebar";
import { ThemeProvider } from "../../components/dashboard/providers/theme-provider";
import { SiteHeader } from "../../components/dashboard/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "../../components/dashboard/ui/sidebar";
import { authOptions } from "../../../lib/auth-options";
import { cn } from "../../lib/utils";
import "./global.css";

// Layout
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fdashboard");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <div
          className={cn(
            "min-h-screen bg-background overscroll-none font-sans antialiased",
            activeThemeValue ? `theme-${activeThemeValue}` : "",
            isScaled ? "theme-scaled" : "",
          )}
        >
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </ActiveThemeProvider>
    </ThemeProvider>
  );
}
