import { useMemo, useState } from "react";

import { ReportFilterCard } from "./components/ReportFilterCard";
import { ReportTableCard } from "./components/ReportTableCard";
import {
  exportInventoryReportToExcel,
  exportInventoryReportToPdf,
} from "./report-export";
import { buildDefaultReportFilters } from "./report-filters";
import { useInventoryReport } from "./use-inventory-report";

import type { ChangeEvent } from "react";

export function MomqillReportsPage() {
  const [filters, setFilters] = useState(buildDefaultReportFilters);

  const reportQuery = useInventoryReport(filters);
  const report = reportQuery.data;

  const isInvalidRange = useMemo(
    () => filters.startDate > filters.endDate,
    [filters.endDate, filters.startDate],
  );

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      startDate: event.target.value,
    }));
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      endDate: event.target.value,
    }));
  };

  return (
    <div className="grid gap-6">
      <ReportFilterCard
        endDate={filters.endDate}
        isInvalidRange={isInvalidRange}
        onEndDateChange={handleEndDateChange}
        onExportExcel={() => report && exportInventoryReportToExcel(report)}
        onExportPdf={() => report && exportInventoryReportToPdf(report)}
        onStartDateChange={handleStartDateChange}
        report={report}
        startDate={filters.startDate}
      />
      <ReportTableCard
        isError={reportQuery.isError}
        isLoading={reportQuery.isLoading}
        report={report}
      />
    </div>
  );
}
