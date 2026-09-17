import { Plus, Tags } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { PageHero } from "../../shared/PageHero";

interface ProductHeroSectionProps {
  onCreate: () => void;
  onManageCategories: () => void;
}

export function ProductHeroSection({ onCreate, onManageCategories }: ProductHeroSectionProps) {
  return (
    <PageHero
      actions={
        <>
          <Button onClick={onManageCategories} size="sm" type="button" variant="outline">
            <Tags className="mr-2 h-4 w-4" />
            Kelola Kategori
          </Button>
          <Button onClick={onCreate} size="sm" type="button">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </>
      }
      description="Kelola daftar produk frozen food yang dipakai di seluruh alur barang masuk, barang keluar, dan monitoring stok."
      title="Master Produk"
    />
  );
}
