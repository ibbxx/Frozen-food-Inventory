import { Pencil, Package2 } from "lucide-react";

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
    return <Badge variant="danger">Stok Habis</Badge>;
  }

  if (product.current_stock <= product.min_stock) {
    return <Badge variant="warning">Perlu Restok</Badge>;
  }

  return <Badge variant="success">Aman</Badge>;
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) {
    return <span className="text-slate-400 italic text-xs">Belum diisi</span>;
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
    <Card className="border-cyan-100/80 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100/60">
        <CardTitle className="text-lg font-bold text-slate-800">Daftar Produk</CardTitle>
        <CardDescription>
          Data produk Momqill yang dipakai di seluruh modul inventori.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/70 text-left text-slate-400 uppercase tracking-wider text-xs font-semibold">
                <th className="py-3 px-4 font-semibold text-center w-12">No</th>
                <th className="py-3 px-4 font-semibold">Produk</th>
                <th className="py-3 px-4 font-semibold">Kategori</th>
                <th className="py-3 px-4 font-semibold text-right">Harga Publik</th>
                <th className="py-3 px-4 font-semibold text-right">Stok</th>
                <th className="py-3 px-4 font-semibold text-right">Min. Stok</th>
                <th className="py-3 px-4 font-semibold text-center">Katalog</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 bg-white">
              {products.length ? (
                products.map((product, index) => (
                  <tr className="hover:bg-slate-50/50 transition-colors align-middle" key={product.id}>
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <Package2 className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{product.product_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {product.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(product.public_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {product.current_stock}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {product.min_stock}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={product.is_public ? "success" : "outline"}>
                        {product.is_public ? "Tampil" : "Tersembunyi"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">{getStatus(product)}</td>
                    <td className="py-3 px-6 text-right">
                      <Button onClick={() => onEdit(product)} size="sm" type="button" variant="outline">
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableRow
                  colSpan={9}
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
