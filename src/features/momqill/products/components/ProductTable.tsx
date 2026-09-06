import { Package2, Pencil } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { EmptyTableRow } from "../../shared/EmptyTableRow";

import type { Product } from "../../types/database";

function getStatus(product: Product) {
  if (product.current_stock <= 0) {
    return <Badge variant="destructive">HABIS</Badge>;
  }

  if (product.current_stock <= product.min_stock) {
    return <Badge variant="warning">RESTOK</Badge>;
  }

  return <Badge variant="success">AMAN</Badge>;
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) {
    return <span className="font-mono text-muted-foreground text-xs">-</span>;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface ProductTableProps {
  onEdit: (product: Product) => void;
  products: Product[];
}

export function ProductTable({ onEdit, products }: ProductTableProps) {
  return (
    <Card className="border-border bg-white shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
              Katalog Master Produk
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Kelola status katalog, kuantitas stok saat ini, dan batas ambang minimum.
            </CardDescription>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {products.length} Varian Terdaftar
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* MOBILE VIEW (< md): Card List tailored for single-thumb operations */}
        <div className="block md:hidden divide-y divide-border">
          {products.length ? (
            products.map((product) => (
              <div
                className="p-3.5 space-y-3 transition-colors hover:bg-slate-50/70"
                key={product.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-md border border-border bg-slate-100 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          alt={product.product_name}
                          className="h-full w-full object-cover"
                          src={product.image_url}
                        />
                      ) : (
                        <Package2 className="h-6 w-6 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm text-foreground truncate">
                        {product.product_name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {product.category}
                        </span>
                        <span className="text-muted-foreground/40">&bull;</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {formatCurrency(product.public_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>{getStatus(product)}</div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                  <div className="flex items-center gap-4 font-mono text-xs">
                    <div>
                      <span className="text-muted-foreground text-[10px] uppercase block">
                        Stok Fisik
                      </span>
                      <span className="font-bold text-foreground tabular-nums text-sm">
                        {product.current_stock}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] uppercase block">
                        Batas Min
                      </span>
                      <span className="text-muted-foreground tabular-nums text-sm">
                        {product.min_stock}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="h-8 px-3 text-xs"
                    onClick={() => onEdit(product)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Ubah
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-mono text-muted-foreground">
              Belum ada data produk. Tambahkan produk baru untuk mulai mengelola stok.
            </div>
          )}
        </div>

        {/* DESKTOP VIEW (>= md): Full Dense Telemetry Table */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4 font-semibold text-center w-12">No</th>
                <th className="py-3 px-4 font-semibold">Produk</th>
                <th className="py-3 px-4 font-semibold">Kategori</th>
                <th className="py-3 px-4 font-semibold text-right">Harga Publik</th>
                <th className="py-3 px-4 font-semibold text-right">Stok Fisik</th>
                <th className="py-3 px-4 font-semibold text-right">Ambang Min</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {products.length ? (
                products.map((product, index) => (
                  <tr
                    className="hover:bg-slate-50/70 transition-colors"
                    key={product.id}
                  >
                    <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded border border-border bg-slate-100 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img
                              alt={product.product_name}
                              className="h-full w-full object-cover"
                              src={product.image_url}
                            />
                          ) : (
                            <Package2 className="h-5 w-5 text-muted-foreground/60" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {product.product_name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            SKU: {product.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-foreground">
                      {formatCurrency(product.public_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-foreground">
                      {product.current_stock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {product.min_stock}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatus(product)}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <Button
                        className="h-8 px-2.5 text-xs"
                        onClick={() => onEdit(product)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableRow
                  colSpan={8}
                  message="Belum ada data produk. Tambahkan produk baru untuk mulai mengelola stok."
                />
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
