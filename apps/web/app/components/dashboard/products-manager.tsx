"use client";

import * as React from "react";
import Image from "next/image";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type Product = {
  id: string;
  sku: string;
  title: string;
  category: string | null;
  priceCents: number;
  stock?: number;
  thumbnail: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
};

type ProductsResponse = {
  ok?: boolean;
  data?: Product[];
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const passthroughLoader = ({ src }: { src: string }) => src;

export function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const [title, setTitle] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState("");
  const [thumbnailDataUrl, setThumbnailDataUrl] = React.useState("");
  const [tags, setTags] = React.useState("");

  async function refreshProducts() {
    const res = await fetch("/api/dashboard/products?limit=100&offset=0", {
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as ProductsResponse;
    if (!res.ok) throw new Error("Failed to refresh products");
    setProducts(Array.isArray(json.data) ? json.data : []);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) {
      setMessage("Price must be a positive number");
      return;
    }

    try {
      setLoading(true);
      const priceCents = Math.round(n * 100);
      const tagArr = tags
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      const res = await fetch("/api/dashboard/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          sku,
          category: category || undefined,
          priceCents,
          description: description || undefined,
          thumbnail: thumbnailDataUrl || thumbnail || undefined,
          tags: tagArr,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message || "Failed to create product");
      }

      await refreshProducts();
      setMessage("Product created");
      setTitle("");
      setSku("");
      setCategory("");
      setPrice("");
      setDescription("");
      setThumbnail("");
      setThumbnailDataUrl("");
      setTags("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-6">
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Add Product</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Create product in database via backend API.
        </p>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="thumbnail-file">Upload Image</Label>
            <Input
              id="thumbnail-file"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  setThumbnailDataUrl("");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  const result = typeof reader.result === "string" ? reader.result : "";
                  setThumbnailDataUrl(result);
                };
                reader.readAsDataURL(file);
              }}
            />
            {thumbnailDataUrl ? (
              <Image
                src={thumbnailDataUrl}
                alt="Thumbnail preview"
                width={96}
                height={96}
                unoptimized
                className="mt-2 h-24 w-24 rounded-md border object-cover"
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
            {message ? <span className="text-muted-foreground ml-3 text-sm">{message}</span> : null}
          </div>
        </form>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Products ({products.length})</h2>
          <Button variant="outline" size="sm" onClick={refreshProducts}>
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.thumbnail || p.imageUrl ? (
                      <Image
                        src={p.thumbnail || p.imageUrl || ""}
                        alt={p.title}
                        width={40}
                        height={40}
                        loader={passthroughLoader}
                        unoptimized
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md text-xs">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.category ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    {usdFormatter.format(p.priceCents / 100)}
                  </TableCell>
                  <TableCell className="text-right">{p.stock ?? 0}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleString("en-US")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-20 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
