import { PackageSearch } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import type { OutgoingHistoryItem } from "../../types/database";

interface OutgoingHistoryCardProps {
  history: OutgoingHistoryItem[];
  isLoading: boolean;
}

export function OutgoingHistoryCard({ history, isLoading }: OutgoingHistoryCardProps) {
  return (
    <Card className="border-cyan-100 shadow-sm">
      <CardHeader>
        <CardTitle>Riwayat Barang Keluar</CardTitle>
        <CardDescription>
          Transaksi terakhir yang telah mengurangi stok produk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Memuat riwayat barang keluar...
          </div>
        ) : (
          <div className="space-y-3">
            {history.length ? (
              history.map((item) => (
                <article
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={item.id}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.date}</Badge>
                        <h3 className="font-medium text-slate-900">{item.product_name}</h3>
                      </div>
                      <p className="text-sm text-slate-600">
                        {item.description || "Tanpa keterangan tambahan."}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Jumlah keluar</p>
                      <p className="text-2xl font-semibold text-slate-900">{item.quantity}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                <PackageSearch className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                Belum ada data barang keluar.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
