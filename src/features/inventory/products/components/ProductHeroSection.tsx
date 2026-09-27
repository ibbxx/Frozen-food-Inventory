import { Plus, Tags } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { PageHero } from "../../shared/PageHero";

interface ProductHeroSectionProps {
  onCreate: () => void;
  /** Hanya diberikan untuk admin, karena pengelolaan kategori dibatasi role admin. */
  onManageCategories?: () => void;
}

export function ProductHeroSection({ onCreate, onManageCategories }: ProductHeroSectionProps) {
  return (
    <PageHero
      actions={
        <>
          {onManageCategories ? (
            <Button onClick={onManageCategories} size="sm" type="button" variant="outline">
              <Tags className="mr-2 h-4 w-4" />
              Kelola Kategori
            </Button>
          ) : null}
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
