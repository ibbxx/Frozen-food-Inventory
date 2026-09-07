import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "./categories-service";
import { useCategoryRecords } from "./use-categories";
import { invalidateAfterCategoryMutation } from "../shared/query-keys";

import type { ProductCategoryRecord } from "../types/database";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastState = { message: string; tone: "success" | "error" } | null;

interface CategoryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Nama-nama kategori yang sedang dipakai minimal satu produk — untuk proteksi hapus. */
  usedCategoryNames: Set<string>;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface CategoryRowProps {
  category: ProductCategoryRecord;
  isDeleting: boolean;
  isEditing: boolean;
  isFallback: boolean;
  isInUse: boolean;
  onCancelDelete: () => void;
  onCancelEdit: () => void;
  onConfirmDelete: () => void;
  onSaveEdit: (newName: string) => void;
  onStartDelete: () => void;
  onStartEdit: () => void;
}

function CategoryRow({
  category,
  isDeleting,
  isEditing,
  isFallback,
  isInUse,
  onCancelDelete,
  onCancelEdit,
  onConfirmDelete,
  onSaveEdit,
  onStartDelete,
  onStartEdit,
}: CategoryRowProps) {
  const editInputRef = useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = useState(category.name);

  const handleStartEdit = () => {
    setEditValue(category.name);
    onStartEdit();
    // Fokus input setelah render
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === category.name) {
      onCancelEdit();
      return;
    }
    onSaveEdit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onCancelEdit();
    }
  };

  // ── Mode: konfirmasi hapus ──
  if (isDeleting) {
    return (
      <li className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-red-50/60 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{category.name}</span>
        </div>
        {isInUse ? (
          <p className="flex items-center gap-1.5 text-xs text-amber-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Kategori ini masih dipakai oleh beberapa produk. Hapus atau pindahkan produk-produk tersebut terlebih dahulu.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Yakin ingin menghapus kategori ini? Tindakan tidak dapat dibatalkan.
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button
            className="h-7 px-3 text-xs"
            disabled={isInUse}
            onClick={onConfirmDelete}
            size="sm"
            type="button"
            variant="destructive"
          >
            Hapus
          </Button>
          <Button
            className="h-7 px-3 text-xs"
            onClick={onCancelDelete}
            size="sm"
            type="button"
            variant="outline"
          >
            Batal
          </Button>
        </div>
      </li>
    );
  }

  // ── Mode: edit nama ──
  if (isEditing) {
    return (
      <li className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
        <Input
          className="h-8 flex-1 text-sm"
          onKeyDown={handleKeyDown}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
          ref={editInputRef}
          value={editValue}
        />
        <Button
          className="h-8 px-3 text-xs"
          disabled={!editValue.trim() || editValue.trim() === category.name}
          onClick={handleSave}
          size="sm"
          type="button"
        >
          Simpan
        </Button>
        <Button
          className="h-8 w-8 p-0"
          onClick={onCancelEdit}
          size="sm"
          type="button"
          variant="ghost"
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Batal edit</span>
        </Button>
      </li>
    );
  }

  // ── Mode: tampilan normal ──
  return (
    <li className="flex items-center gap-2 rounded-lg border border-border/60 bg-white px-3 py-2 hover:bg-slate-50/80 transition-colors">
      <span className="flex-1 truncate text-sm text-foreground">{category.name}</span>
      {isFallback ? (
        <span className="text-[10px] text-muted-foreground/60 italic">memuat…</span>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            aria-label={`Edit kategori ${category.name}`}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleStartEdit}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            aria-label={`Hapus kategori ${category.name}`}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={onStartDelete}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </li>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function CategoryManageModal({
  isOpen,
  onClose,
  usedCategoryNames,
}: CategoryManageModalProps) {
  const queryClient = useQueryClient();
  const { data: categories, isLoading, isError, error, isFetching } = useCategoryRecords();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const showToast = (message: string, tone: "success" | "error") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Mutations ──

  const createMutation = useMutation({
    mutationFn: () => createCategory(newCategoryName),
    onSuccess: async () => {
      await invalidateAfterCategoryMutation(queryClient);
      setNewCategoryName("");
      setAddError(null);
      showToast("Kategori berhasil ditambahkan.", "success");
    },
    onError: (error) => {
      showToast(
        error instanceof Error ? error.message : "Gagal menambahkan kategori.",
        "error",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateCategory(id, name),
    onSuccess: async () => {
      await invalidateAfterCategoryMutation(queryClient);
      setEditingId(null);
      showToast("Kategori berhasil diperbarui.", "success");
    },
    onError: (error) => {
      showToast(
        error instanceof Error ? error.message : "Gagal memperbarui kategori.",
        "error",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await invalidateAfterCategoryMutation(queryClient);
      setDeletingId(null);
      showToast("Kategori berhasil dihapus.", "success");
    },
    onError: (error) => {
      showToast(
        error instanceof Error ? error.message : "Gagal menghapus kategori.",
        "error",
      );
    },
  });

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // ── Handlers ──

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setAddError("Nama kategori tidak boleh kosong.");
      return;
    }

    const isDuplicate = categories?.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      setAddError("Kategori dengan nama ini sudah ada.");
      return;
    }

    setAddError(null);
    createMutation.mutate();
  };

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Kelola Kategori">
        <div className="flex flex-col gap-4">
          {/* Daftar kategori */}
          <div className="max-h-72 overflow-y-auto rounded-xl border border-border/60 bg-slate-50/40 p-1.5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Memuat kategori…
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error instanceof Error ? error.message : "Gagal memuat kategori dari database."}</p>
              </div>
            ) : !categories?.length ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Belum ada kategori. Tambahkan di bawah.
              </div>
            ) : (
              <ul className="flex flex-col gap-1" role="list">
                {categories.map((cat) => {
                  const isFallback = isFetching && cat.id.startsWith("fallback-");
                  return (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      isDeleting={deletingId === cat.id}
                      isEditing={editingId === cat.id}
                      isFallback={isFallback}
                      isInUse={usedCategoryNames.has(cat.name)}
                      onCancelDelete={() => setDeletingId(null)}
                      onCancelEdit={() => setEditingId(null)}
                      onConfirmDelete={() => deleteMutation.mutate(cat.id)}
                      onSaveEdit={(name) => updateMutation.mutate({ id: cat.id, name })}
                      onStartDelete={() => {
                        setEditingId(null);
                        setDeletingId(cat.id);
                      }}
                      onStartEdit={() => {
                        setDeletingId(null);
                        setEditingId(cat.id);
                      }}
                    />
                  );
                })}
              </ul>
            )}
          </div>

          {/* Form tambah kategori baru */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Tambah Kategori Baru
            </label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                disabled={isMutating}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewCategoryName(e.target.value);
                  if (addError) setAddError(null);
                }}
                onKeyDown={handleAddKeyDown}
                placeholder="Nama kategori baru…"
                value={newCategoryName}
              />
              <Button
                disabled={isMutating || !newCategoryName.trim()}
                onClick={handleAddCategory}
                size="sm"
                type="button"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Tambah
              </Button>
            </div>
            {addError ? (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {addError}
              </p>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t pt-3">
            <Button onClick={onClose} type="button" variant="outline">
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast notifikasi di luar Modal agar z-index tidak bentrok */}
      {toast ? (
        <div
          aria-live={toast.tone === "success" ? "polite" : "assertive"}
          className={`fixed right-4 top-4 z-[70] flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
            toast.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role={toast.tone === "success" ? "status" : "alert"}
        >
          <AlertCircle
            className={`h-4 w-4 shrink-0 ${toast.tone === "success" ? "text-emerald-600" : "text-red-600"}`}
          />
          {toast.message}
        </div>
      ) : null}
    </>
  );
}
