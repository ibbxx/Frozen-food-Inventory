import { PageErrorState } from "../shared/PageErrorState";
import { PageHero } from "../shared/PageHero";

import { InventorySummarySection } from "./components/InventorySummarySection";
import { InventoryTableCard } from "./components/InventoryTableCard";
import { useInventoryMonitoring } from "./use-inventory-monitoring";

export function MomqillInventoryPage() {
  const inventoryQuery = useInventoryMonitoring();
  const inventory = inventoryQuery.data;

  if (inventoryQuery.isLoading && !inventory) {
    return <div className="page-loader">Memuat monitoring stok...</div>;
  }

  if (inventoryQuery.isError) {
    return (
      <PageErrorState
        description="Data produk belum bisa diambil. Periksa koneksi lalu muat ulang halaman."
        title="Monitoring stok gagal dimuat"
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHero
        description="Pantau ketersediaan produk secara real-time untuk mencegah stock mismatch dan mempercepat keputusan restok."
        title="Monitoring Stok Barang"
      />
      <InventorySummarySection inventory={inventory} />
      <InventoryTableCard inventory={inventory} />
    </div>
  );
}
