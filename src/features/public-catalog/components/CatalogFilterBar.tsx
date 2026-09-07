import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PublicCatalogStockStatus } from "@/features/momqill/types/database";
import { productCategoryOptions } from "@/shared/lib/product-categories";
import { Button } from "@/shared/ui/button";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  Circle,
  ListFilter,
  RefreshCw,
  Search,
  Tag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { nanoid } from "nanoid";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Public exported types (consumed by PublicCatalogPage) ───────────────────

export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";
export type StockFilterOption = "all" | PublicCatalogStockStatus;

export interface CatalogFilters {
  keyword: string;
  category: string;       // "Semua" = no category filter
  stockStatus: StockFilterOption;
  sort: SortOption;
}

// ─── Internal filter pill model ──────────────────────────────────────────────

export enum CatalogFilterType {
  KATEGORI = "Kategori",
  STOK     = "Stok",
  URUTAN   = "Urutan",
}

export enum CatalogFilterOperator {
  ADALAH     = "adalah",
  BUKAN      = "bukan",
  SALAH_SATU = "salah satu dari",
}

interface ActiveFilter {
  id: string;
  type: CatalogFilterType;
  operator: CatalogFilterOperator;
  value: string[];
}

// ─── Component props ─────────────────────────────────────────────────────────

interface CatalogFilterBarProps {
  filters: CatalogFilters;
  isFetching: boolean;
  onFiltersChange: (filters: CatalogFilters) => void;
  onRefresh: () => void;
  totalVisible: number;
  totalAll: number;
}

// ─── Category groups ─────────────────────────────────────────────────────────

const CATEGORY_GROUPS: { label: string; categories: string[] }[] = [
  { label: "Daging & Protein",  categories: ["Daging", "Sapi", "Ayam", "Sosis", "Bakso", "Marinasi"] },
  { label: "Camilan & Frozen",  categories: ["Nuggets", "Snack Frozen", "Kentang", "Kulit"] },
  { label: "Sayuran & Suki",    categories: ["Sayuran Frozen", "Suki"] },
  { label: "Bumbu & Pelengkap", categories: ["Bumbu", "Saos", "Mayo", "Keju"] },
  { label: "Paket",             categories: ["Paket Hemat"] },
];

const ALL_GROUPED = CATEGORY_GROUPS.flatMap((g) => g.categories);
const UNGROUPED   = (productCategoryOptions as readonly string[]).filter(
  (c) => !ALL_GROUPED.includes(c),
);
const FINAL_CATEGORY_GROUPS =
  UNGROUPED.length > 0
    ? [...CATEGORY_GROUPS, { label: "Lainnya", categories: UNGROUPED }]
    : CATEGORY_GROUPS;

// ─── Stock & sort option maps ─────────────────────────────────────────────────

const STOCK_OPTIONS: { value: StockFilterOption; label: string; dot: string }[] = [
  { value: "available", label: "Tersedia",  dot: "bg-emerald-500" },
  { value: "limited",   label: "Terbatas",  dot: "bg-amber-500"   },
  { value: "out",       label: "Habis",     dot: "bg-red-400"     },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc",   label: "Nama A–Z"        },
  { value: "name-desc",  label: "Nama Z–A"        },
  { value: "price-asc",  label: "Harga Terendah"  },
  { value: "price-desc", label: "Harga Tertinggi" },
];

// filter type picker options shown in the "add filter" popover
const FILTER_TYPE_DEFS = [
  {
    type: CatalogFilterType.KATEGORI,
    defaultOp:  CatalogFilterOperator.ADALAH,
    defaultVal: [] as string[],
  },
  {
    type: CatalogFilterType.STOK,
    defaultOp:  CatalogFilterOperator.ADALAH,
    defaultVal: ["available"],
  },
  {
    type: CatalogFilterType.URUTAN,
    defaultOp:  CatalogFilterOperator.ADALAH,
    defaultVal: ["name-asc"],
  },
];

// ─── AnimateChangeInHeight ────────────────────────────────────────────────────

interface AnimateChangeInHeightProps {
  children: React.ReactNode;
  className?: string;
}

function AnimateChangeInHeight({ children, className }: AnimateChangeInHeightProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setHeight(entries[0].contentRect.height);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      style={{ height }}
      animate={{ height }}
      transition={{ duration: 0.1, ease: "easeIn" }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
}

// ─── FilterIcon ───────────────────────────────────────────────────────────────

function FilterIcon({ type }: { type: string }) {
  switch (type) {
    case CatalogFilterType.KATEGORI: return <Tag          className="size-3.5" />;
    case CatalogFilterType.STOK:     return <Circle       className="size-3.5" />;
    case CatalogFilterType.URUTAN:   return <ArrowUpDown  className="size-3.5" />;
    // stock value icons
    case "available": return <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />;
    case "limited":   return <span className="inline-block h-2 w-2 rounded-full bg-amber-500  shrink-0" />;
    case "out":       return <span className="inline-block h-2 w-2 rounded-full bg-red-400    shrink-0" />;
    // sort value icons
    case "name-asc":   return <ArrowDownAZ className="size-3.5" />;
    case "name-desc":  return <ArrowUpAZ   className="size-3.5" />;
    case "price-asc":  return <ArrowUpDown className="size-3.5" />;
    case "price-desc": return <ArrowUpDown className="size-3.5 rotate-180" />;
    default:           return <Tag         className="size-3.5" />;
  }
}

// ─── FilterOperatorDropdown ───────────────────────────────────────────────────

function FilterOperatorDropdown({
  filterType,
  operator,
  filterValues,
  setOperator,
}: {
  filterType: CatalogFilterType;
  operator: CatalogFilterOperator;
  filterValues: string[];
  setOperator: (op: CatalogFilterOperator) => void;
}) {
  const operators: CatalogFilterOperator[] =
    filterType === CatalogFilterType.KATEGORI
      ? filterValues.length > 1
        ? [CatalogFilterOperator.SALAH_SATU, CatalogFilterOperator.BUKAN]
        : [CatalogFilterOperator.ADALAH, CatalogFilterOperator.BUKAN]
      : [CatalogFilterOperator.ADALAH];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-muted hover:bg-muted/50 px-1.5 py-1 text-muted-foreground hover:text-primary transition shrink-0 text-xs focus:outline-none">
        {operator}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit min-w-fit">
        {operators.map((op) => (
          <DropdownMenuItem
            key={op}
            className="text-xs"
            onClick={() => setOperator(op)}
          >
            {op}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Category value combobox (multi-select, grouped) ─────────────────────────

function FilterValueCategoryCombobox({
  filterValues,
  setFilterValues,
}: {
  filterValues: string[];
  setFilterValues: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
    setTimeout(() => setInput(""), 200);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(() => setInput(""), 200);
      }}
    >
      <PopoverTrigger className="rounded-none px-1.5 py-1 bg-muted hover:bg-muted/50 transition text-muted-foreground hover:text-primary shrink-0 text-xs focus:outline-none">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1">
            <AnimatePresence mode="popLayout">
              {filterValues.slice(0, 3).map((v) => (
                <motion.span
                  key={v}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  <Tag className="size-3" />
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          <span>
            {filterValues.length === 0
              ? "Pilih…"
              : filterValues.length === 1
              ? filterValues[0]
              : `${filterValues.length} dipilih`}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[230px] p-0" align="start">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder="Cari kategori..."
              className="h-9"
              value={input}
              onInput={(e) => setInput(e.currentTarget.value)}
              ref={inputRef}
            />
            <CommandList>
              <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>

              {/* Already-selected section */}
              {filterValues.length > 0 && (
                <CommandGroup>
                  {filterValues.map((v) => (
                    <CommandItem
                      key={v}
                      className="group flex gap-2 items-center text-xs"
                      onSelect={() => {
                        setFilterValues(filterValues.filter((x) => x !== v));
                        close();
                      }}
                    >
                      <Checkbox checked={true} />
                      {v}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Grouped non-selected options */}
              {FINAL_CATEGORY_GROUPS.map((group, gi) => {
                const opts = group.categories.filter(
                  (c) =>
                    !filterValues.includes(c) &&
                    (!input || c.toLowerCase().includes(input.toLowerCase())),
                );
                if (opts.length === 0) return null;
                return (
                  <div key={group.label}>
                    {(gi > 0 || filterValues.length > 0) && <CommandSeparator />}
                    <CommandGroup heading={group.label}>
                      {opts.map((cat) => (
                        <CommandItem
                          key={cat}
                          value={cat}
                          className="group flex gap-2 items-center text-xs"
                          onSelect={(val) => {
                            setFilterValues([...filterValues, val]);
                            close();
                          }}
                        >
                          <Checkbox
                            checked={false}
                            className="opacity-0 group-data-[selected=true]:opacity-100"
                          />
                          {cat}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </div>
                );
              })}
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
}

// ─── Stock value combobox (single-select) ────────────────────────────────────

function FilterValueStockCombobox({
  filterValues,
  setFilterValues,
}: {
  filterValues: string[];
  setFilterValues: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = STOCK_OPTIONS.find((o) => o.value === filterValues[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="rounded-none px-1.5 py-1 bg-muted hover:bg-muted/50 transition text-muted-foreground hover:text-primary shrink-0 text-xs focus:outline-none">
        <div className="flex items-center gap-1.5">
          {current && (
            <span className={cn("inline-block h-2 w-2 rounded-full shrink-0", current.dot)} />
          )}
          <span>{current?.label ?? filterValues[0] ?? "Pilih…"}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0" align="start">
        <AnimateChangeInHeight>
          <Command>
            <CommandList>
              <CommandGroup>
                {STOCK_OPTIONS.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    className="flex gap-2 items-center text-xs"
                    onSelect={(v) => {
                      setFilterValues([v]);
                      setOpen(false);
                    }}
                  >
                    <span className={cn("inline-block h-2 w-2 rounded-full shrink-0", opt.dot)} />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
}

// ─── Sort value combobox (single-select) ─────────────────────────────────────

function FilterValueSortCombobox({
  filterValues,
  setFilterValues,
}: {
  filterValues: string[];
  setFilterValues: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.value === filterValues[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="rounded-none px-1.5 py-1 bg-muted hover:bg-muted/50 transition text-muted-foreground hover:text-primary shrink-0 text-xs focus:outline-none">
        <div className="flex items-center gap-1.5">
          <FilterIcon type={filterValues[0] ?? ""} />
          <span>{current?.label ?? filterValues[0] ?? "Pilih…"}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0" align="start">
        <AnimateChangeInHeight>
          <Command>
            <CommandList>
              <CommandGroup>
                {SORT_OPTIONS.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    className="flex gap-2 items-center text-xs"
                    onSelect={(v) => {
                      setFilterValues([v]);
                      setOpen(false);
                    }}
                  >
                    <FilterIcon type={opt.value} />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
}

// ─── Active filter pills strip ────────────────────────────────────────────────

function ActiveFilterPills({
  activeFilters,
  setActiveFilters,
}: {
  activeFilters: ActiveFilter[];
  setActiveFilters: Dispatch<SetStateAction<ActiveFilter[]>>;
}) {
  const visible = activeFilters.filter((f) => f.value.length > 0);
  if (visible.length === 0) return null;

  function updateFilter<K extends keyof ActiveFilter>(
    id: string,
    key: K,
    value: ActiveFilter[K],
  ) {
    setActiveFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((filter) => (
        <div key={filter.id} className="flex gap-[1px] items-center text-xs">
          {/* Type chip */}
          <div className="flex gap-1.5 shrink-0 rounded-l-md bg-muted px-1.5 py-1 items-center text-foreground">
            <FilterIcon type={filter.type} />
            {filter.type}
          </div>

          {/* Operator */}
          <FilterOperatorDropdown
            filterType={filter.type}
            operator={filter.operator}
            filterValues={filter.value}
            setOperator={(op) => updateFilter(filter.id, "operator", op)}
          />

          {/* Value combobox */}
          {filter.type === CatalogFilterType.KATEGORI ? (
            <FilterValueCategoryCombobox
              filterValues={filter.value}
              setFilterValues={(vals) => updateFilter(filter.id, "value", vals)}
            />
          ) : filter.type === CatalogFilterType.STOK ? (
            <FilterValueStockCombobox
              filterValues={filter.value}
              setFilterValues={(vals) => updateFilter(filter.id, "value", vals)}
            />
          ) : (
            <FilterValueSortCombobox
              filterValues={filter.value}
              setFilterValues={(vals) => updateFilter(filter.id, "value", vals)}
            />
          )}

          {/* Remove */}
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() =>
              setActiveFilters((prev) => prev.filter((f) => f.id !== filter.id))
            }
            className="bg-muted rounded-l-none rounded-r-md h-6 w-6 text-muted-foreground hover:text-primary hover:bg-muted/50 transition shrink-0"
          >
            <X className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Add-filter popover ───────────────────────────────────────────────────────

function AddFilterPopover({
  activeFilters,
  onAdd,
}: {
  activeFilters: ActiveFilter[];
  onAdd: (f: ActiveFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CatalogFilterType | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = activeFilters.some((f) => f.value.length > 0);

  function reset() {
    setSelectedType(null);
    setCommandInput("");
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className={cn(
            "h-6 text-xs items-center rounded-sm flex gap-1.5 transition",
            hasActiveFilters && "w-6 px-0",
          )}
        >
          <ListFilter className="size-3 shrink-0 text-muted-foreground" />
          {!hasActiveFilters && <span>Filter</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={selectedType ?? "Filter..."}
              className="h-9"
              value={commandInput}
              onInput={(e) => setCommandInput(e.currentTarget.value)}
              ref={commandInputRef}
            />
            <CommandList>
              <CommandEmpty>Tidak ada hasil.</CommandEmpty>

              {selectedType ? (
                // Step 2 — pick initial value for the chosen type
                <CommandGroup>
                  {selectedType === CatalogFilterType.KATEGORI &&
                    FINAL_CATEGORY_GROUPS.flatMap((g) => g.categories)
                      .filter((c) =>
                        !commandInput || c.toLowerCase().includes(commandInput.toLowerCase()),
                      )
                      .map((cat) => (
                        <CommandItem
                          key={cat}
                          value={cat}
                          className="text-muted-foreground flex gap-2 items-center text-xs"
                          onSelect={(val) => {
                            onAdd({
                              id: nanoid(),
                              type: CatalogFilterType.KATEGORI,
                              operator: CatalogFilterOperator.ADALAH,
                              value: [val],
                            });
                            setTimeout(reset, 200);
                            setOpen(false);
                          }}
                        >
                          <Tag className="size-3.5" />
                          <span className="text-accent-foreground">{cat}</span>
                        </CommandItem>
                      ))}

                  {selectedType === CatalogFilterType.STOK &&
                    STOCK_OPTIONS.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.value}
                        className="text-muted-foreground flex gap-2 items-center text-xs"
                        onSelect={(val) => {
                          onAdd({
                            id: nanoid(),
                            type: CatalogFilterType.STOK,
                            operator: CatalogFilterOperator.ADALAH,
                            value: [val],
                          });
                          setTimeout(reset, 200);
                          setOpen(false);
                        }}
                      >
                        <span className={cn("inline-block h-2 w-2 rounded-full shrink-0", opt.dot)} />
                        <span className="text-accent-foreground">{opt.label}</span>
                      </CommandItem>
                    ))}

                  {selectedType === CatalogFilterType.URUTAN &&
                    SORT_OPTIONS.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.value}
                        className="text-muted-foreground flex gap-2 items-center text-xs"
                        onSelect={(val) => {
                          onAdd({
                            id: nanoid(),
                            type: CatalogFilterType.URUTAN,
                            operator: CatalogFilterOperator.ADALAH,
                            value: [val],
                          });
                          setTimeout(reset, 200);
                          setOpen(false);
                        }}
                      >
                        <FilterIcon type={opt.value} />
                        <span className="text-accent-foreground">{opt.label}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              ) : (
                // Step 1 — pick filter type
                <CommandGroup>
                  {FILTER_TYPE_DEFS.map((def) => (
                    <CommandItem
                      key={def.type}
                      value={def.type}
                      className="text-muted-foreground flex gap-2 items-center text-xs"
                      onSelect={(val) => {
                        setSelectedType(val as CatalogFilterType);
                        setCommandInput("");
                        commandInputRef.current?.focus();
                      }}
                    >
                      <FilterIcon type={def.type} />
                      <span className="text-accent-foreground">{def.type}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
}

// ─── CatalogFilterBar (main export) ──────────────────────────────────────────

const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  keyword:     "",
  category:    "Semua",
  stockStatus: "all",
  sort:        "name-asc",
};

export function CatalogFilterBar({
  filters,
  isFetching,
  onFiltersChange,
  onRefresh,
  totalVisible,
  totalAll,
}: CatalogFilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Sync pill state → CatalogFilters whenever pills change
  useEffect(() => {
    const next: CatalogFilters = {
      keyword:     filters.keyword,
      category:    "Semua",
      stockStatus: "all",
      sort:        "name-asc",
    };

    for (const f of activeFilters) {
      if (f.value.length === 0) continue;
      if (f.type === CatalogFilterType.KATEGORI) {
        next.category = f.value[0];
      } else if (f.type === CatalogFilterType.STOK) {
        next.stockStatus = f.value[0] as StockFilterOption;
      } else if (f.type === CatalogFilterType.URUTAN) {
        next.sort = f.value[0] as SortOption;
      }
    }

    onFiltersChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters, filters.keyword]);

  const hasActiveFilters = activeFilters.some((f) => f.value.length > 0);

  function clearAll() {
    setActiveFilters([]);
    onFiltersChange({ ...DEFAULT_CATALOG_FILTERS, keyword: filters.keyword });
  }

  return (
    <section className="mt-4 sm:mt-6 space-y-3">

      {/* ── Row 1: Search + Refresh ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            aria-label="Cari produk"
            className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-9 text-sm text-foreground shadow-2xs placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary font-sans"
            onChange={(e) =>
              onFiltersChange({ ...filters, keyword: e.target.value })
            }
            placeholder="Cari nugget, dimsum, bakso, kentang..."
            type="search"
            value={filters.keyword}
          />
          {filters.keyword && (
            <button
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              onClick={() => onFiltersChange({ ...filters, keyword: "" })}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button
          aria-label="Segarkan katalog"
          className="h-11 px-3 shrink-0 gap-1.5 text-xs"
          disabled={isFetching}
          onClick={onRefresh}
          title="Segarkan data katalog"
          type="button"
          variant="outline"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          <span className="hidden sm:inline font-medium">Segarkan</span>
        </Button>
      </div>

      {/* ── Row 2: Filter pills + Add filter + Clear + Count ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Active pills */}
        <ActiveFilterPills
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />

        {/* Clear all */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="transition h-6 text-xs items-center rounded-sm"
            onClick={clearAll}
          >
            Hapus filter
          </Button>
        )}

        {/* Add filter */}
        <AddFilterPopover
          activeFilters={activeFilters}
          onAdd={(f) => setActiveFilters((prev) => [...prev, f])}
        />

        {/* Result count */}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground whitespace-nowrap">
          {totalVisible === totalAll
            ? `${totalAll} produk`
            : `${totalVisible} / ${totalAll} produk`}
        </span>
      </div>

    </section>
  );
}
