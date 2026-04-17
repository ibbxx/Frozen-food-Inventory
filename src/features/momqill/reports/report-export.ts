import type { InventoryReportPayload } from "../types/database";

function fileStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function reportRowsToPlainObject(report: InventoryReportPayload) {
  return report.rows.map((row, index) => ({
    No: index + 1,
    "Nama Produk": row.product_name,
    "Stok Awal": row.opening_stock,
    "Total Masuk": row.total_incoming,
    "Total Keluar": row.total_outgoing,
    "Stok Akhir": row.closing_stock,
  }));
}

export async function exportInventoryReportToExcel(report: InventoryReportPayload): Promise<void> {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(reportRowsToPlainObject(report));
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Inventori");
  XLSX.writeFile(workbook, `laporan-inventori-${fileStamp()}.xlsx`);
}

export async function exportInventoryReportToPdf(report: InventoryReportPayload): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const document = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  document.setFontSize(16);
  document.text("Laporan Inventori Momqill Frozen Food", 40, 42);

  document.setFontSize(10);
  document.text(
    `Periode ${report.filters.startDate} s/d ${report.filters.endDate}`,
    40,
    62,
  );

  autoTable(document, {
    startY: 80,
    head: [["No", "Nama Produk", "Stok Awal", "Total Masuk", "Total Keluar", "Stok Akhir"]],
    body: report.rows.map((row, index) => [
      index + 1,
      row.product_name,
      row.opening_stock,
      row.total_incoming,
      row.total_outgoing,
      row.closing_stock,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [15, 118, 110],
    },
  });

  document.save(`laporan-inventori-${fileStamp()}.pdf`);
}
