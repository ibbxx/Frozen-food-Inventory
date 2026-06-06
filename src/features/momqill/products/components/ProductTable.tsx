import { Pencil } from "lucide-react";

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
  if (value === null) {
    return "Belum diisi";
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
    <Card className="border-cyan-100 shadow-sm">
      <CardHeader>
        <CardTitle>Daftar Produk</CardTitle>
        <CardDescription>
          Data produk Momqill yang dipakai di seluruh modul inventori.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 pr-4 font-medium">No</th>
                <th className="pb-3 pr-4 font-medium">Nama Produk</th>
                <th className="pb-3 pr-4 font-medium">Kategori</th>
                <th className="pb-3 pr-4 font-medium">Harga Publik</th>
                <th className="pb-3 pr-4 font-medium">Stok Saat Ini</th>
                <th className="pb-3 pr-4 font-medium">Stok Minimum</th>
                <th className="pb-3 pr-4 font-medium">Katalog</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length ? (
                products.map((product, index) => (
                  <tr className="border-b last:border-b-0" key={product.id}>
                    <td className="py-4 pr-4">{index + 1}</td>
                    <td className="py-4 pr-4 font-medium text-slate-900">{product.product_name}</td>
                    <td className="py-4 pr-4">{product.category}</td>
                    <td className="py-4 pr-4">{formatCurrency(product.public_price)}</td>
                    <td className="py-4 pr-4">{product.current_stock}</td>
                    <td className="py-4 pr-4">{product.min_stock}</td>
                    <td className="py-4 pr-4">
                      <Badge variant={product.is_public ? "success" : "outline"}>
                        {product.is_public ? "Tampil" : "Tersembunyi"}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4">{getStatus(product)}</td>
                    <td className="py-4">
                      <Button onClick={() => onEdit(product)} size="sm" type="button" variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
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
