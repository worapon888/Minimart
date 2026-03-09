"use client";

import * as React from "react";
import { Button } from "./ui/button";

async function post(path: string, count: number) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text) as { message?: string };
      throw new Error(parsed.message || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }
}

export function DemoDataControls() {
  const [loading, setLoading] = React.useState<"seed" | "cleanup" | null>(null);
  const [message, setMessage] = React.useState("");

  const run = async (action: "seed" | "cleanup") => {
    try {
      setLoading(action);
      setMessage("");
      await post(
        action === "seed"
          ? "/api/dashboard/dev/seed"
          : "/api/dashboard/dev/cleanup",
        2,
      );
      setMessage(
        action === "seed"
          ? "Demo data loaded. Refreshing..."
          : "Demo data cleared. Refreshing...",
      );
      window.location.reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 lg:px-6">
      <Button
        size="sm"
        variant="outline"
        onClick={() => run("seed")}
        disabled={loading !== null}
      >
        {loading === "seed" ? "Loading..." : "Load demo data"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => run("cleanup")}
        disabled={loading !== null}
      >
        {loading === "cleanup" ? "Clearing..." : "Clear demo data"}
      </Button>
      {message ? <span className="text-muted-foreground text-sm">{message}</span> : null}
    </div>
  );
}
