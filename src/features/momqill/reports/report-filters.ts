import type { InventoryReportFilters } from "../types/database";

export function defaultStartDate(): string {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

export function defaultEndDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildDefaultReportFilters(): InventoryReportFilters {
  return {
    startDate: defaultStartDate(),
    endDate: defaultEndDate(),
  };
}
