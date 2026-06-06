import { SectionCard } from "@/shared/ui/SectionCard";

const roles = [
  {
    role: "Admin",
    access: "Akses penuh ke dashboard, produk, inventori, laporan, transaksi barang masuk dan keluar, serta pengaturan tim.",
  },
  {
    role: "Staf",
    access: "Akses operasional ke dashboard, inventori, laporan, serta transaksi barang masuk dan keluar tanpa akses pengaturan tim.",
  },
];

export function TeamPage() {
  return (
    <div className="grid gap-6">
      <SectionCard title="Tim">
        <div className="list-stack">
          {roles.map((item) => (
            <article className="feed-item" key={item.role}>
              <div>
                <h3>{item.role}</h3>
                <p>{item.access}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
