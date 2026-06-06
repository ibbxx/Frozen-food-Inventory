export type UUID = string;
export type ISODateString = string;
export type UserRole = "admin" | "staff";
export type ProductCategory = "Daging" | "Suki" | "Paket Hemat";
export type StockTransactionType = "incoming" | "outgoing";
export type PublicCatalogStockStatus = "available" | "limited" | "out";

export interface UserProfile {
  id: UUID;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface ProfileSummary {
  id: UUID;
  full_name: string;
  role: UserRole;
}

export interface Product {
  id: UUID;
  product_name: string;
  category: ProductCategory;
  public_price: number | null;
  image_url: string | null;
  is_public: boolean;
  current_stock: number;
  min_stock: number;
  created_at: string;
}

export interface IncomingItem {
  id: UUID;
  date: ISODateString;
  product_id: UUID;
  quantity: number;
  supplier_name: string;
  created_by: UUID | null;
  created_at: string;
}

export interface OutgoingItem {
  id: UUID;
  date: ISODateString;
  product_id: UUID;
  quantity: number;
  description: string | null;
  created_by: UUID | null;
  created_at: string;
}

export type InventoryLogSourceTable = "incoming_items" | "outgoing_items" | "products";
export type InventoryMovementType = "incoming" | "outgoing" | "adjustment";

export interface InventoryLog {
  id: UUID;
  product_id: UUID;
  source_table: InventoryLogSourceTable;
  source_id: UUID;
  movement_type: InventoryMovementType;
  quantity_delta: number;
  stock_before: number;
  stock_after: number;
  notes: string | null;
  created_by: UUID;
  created_at: string;
}

export interface StockLog {
  id: UUID;
  product_id: UUID;
  source_transaction_id: UUID | null;
  old_stock: number;
  change_amount: number;
  new_stock: number;
  type: StockTransactionType;
  notes: string | null;
  created_by: UUID;
  created_at: string;
}

export interface StockLogHistoryItem {
  id: UUID;
  product_name: string;
  staff_name: string;
  old_stock: number;
  change_amount: number;
  new_stock: number;
  type: StockTransactionType;
  notes: string | null;
  created_at: string;
}

export interface CreateStockTransactionInput {
  date: ISODateString;
  notes: string;
  product_id: UUID;
  quantity: number;
  type: StockTransactionType;
}

export interface PublicCatalogProduct {
  id: UUID;
  product_name: string;
  category: ProductCategory;
  public_price: number | null;
  image_url: string | null;
  stock_status: PublicCatalogStockStatus;
}

export interface DashboardSummary {
  totalProducts: number;
  incomingToday: number;
  outgoingToday: number;
  lowStockCount: number;
}

export interface DashboardTrendPoint {
  label: string;
  incoming: number;
  outgoing: number;
  net: number;
}

export interface DashboardMonthlyPoint {
  label: string;
  incoming: number;
  outgoing: number;
}

export interface StockAlert {
  id: UUID;
  product_name: string;
  current_stock: number;
  min_stock: number;
  gap: number;
}

export interface DashboardPayload {
  summary: DashboardSummary;
  dailyTrend: DashboardTrendPoint[];
  monthlyComparison: DashboardMonthlyPoint[];
  lowStockProducts: StockAlert[];
}

export interface OutgoingHistoryItem {
  id: UUID;
  date: ISODateString;
  product_id: UUID;
  product_name: string;
  quantity: number;
  description: string | null;
  created_at: string;
}

export interface IncomingHistoryItem {
  id: UUID;
  date: ISODateString;
  product_id: UUID;
  product_name: string;
  quantity: number;
  supplier_name: string;
  created_at: string;
}

export interface CreateOutgoingItemInput {
  date: ISODateString;
  product_id: UUID;
  quantity: number;
  description: string;
}

export interface CreateIncomingItemInput {
  date: ISODateString;
  product_id: UUID;
  quantity: number;
  supplier_name: string;
}

export interface InventoryReportFilters {
  startDate: ISODateString;
  endDate: ISODateString;
}

export interface InventoryReportRow {
  id: UUID;
  product_name: string;
  opening_stock: number;
  total_incoming: number;
  total_outgoing: number;
  closing_stock: number;
}

export interface InventoryReportPayload {
  filters: InventoryReportFilters;
  rows: InventoryReportRow[];
  summary: {
    totalProducts: number;
    totalIncoming: number;
    totalOutgoing: number;
  };
}

export type StockStatus = "safe" | "low" | "out";

export interface InventoryMonitoringRow {
  id: UUID;
  product_name: string;
  current_stock: number;
  min_stock: number;
  status: StockStatus;
  progress_percent: number;
}

export interface InventoryMonitoringPayload {
  summary: {
    safe: number;
    low: number;
    out: number;
  };
  rows: InventoryMonitoringRow[];
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: {
          id: UUID;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: UUID;
          product_name: string;
          category?: ProductCategory;
          public_price?: number | null;
          image_url?: string | null;
          is_public?: boolean;
          current_stock?: number;
          min_stock?: number;
          created_at?: string;
        };
        Update: {
          product_name?: string;
          category?: ProductCategory;
          public_price?: number | null;
          image_url?: string | null;
          is_public?: boolean;
          current_stock?: number;
          min_stock?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      incoming_items: {
        Row: IncomingItem;
        Insert: {
          id?: UUID;
          date?: ISODateString;
          product_id: UUID;
          quantity: number;
          supplier_name: string;
          created_by?: UUID | null;
          created_at?: string;
        };
        Update: {
          date?: ISODateString;
          product_id?: UUID;
          quantity?: number;
          supplier_name?: string;
          created_by?: UUID | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incoming_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      outgoing_items: {
        Row: OutgoingItem;
        Insert: {
          id?: UUID;
          date?: ISODateString;
          product_id: UUID;
          quantity: number;
          description?: string | null;
          created_by?: UUID | null;
          created_at?: string;
        };
        Update: {
          date?: ISODateString;
          product_id?: UUID;
          quantity?: number;
          description?: string | null;
          created_by?: UUID | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "outgoing_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      inventory_logs: {
        Row: InventoryLog;
        Insert: {
          id?: UUID;
          product_id: UUID;
          source_table: InventoryLogSourceTable;
          source_id: UUID;
          movement_type: InventoryMovementType;
          quantity_delta: number;
          stock_before: number;
          stock_after: number;
          notes?: string | null;
          created_by?: UUID;
          created_at?: string;
        };
        Update: {
          product_id?: UUID;
          source_table?: InventoryLogSourceTable;
          source_id?: UUID;
          movement_type?: InventoryMovementType;
          quantity_delta?: number;
          stock_before?: number;
          stock_after?: number;
          notes?: string | null;
          created_by?: UUID;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_logs_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      stock_logs: {
        Row: StockLog;
        Insert: {
          id?: UUID;
          product_id: UUID;
          source_transaction_id?: UUID | null;
          old_stock: number;
          change_amount: number;
          new_stock: number;
          type: StockTransactionType;
          notes?: string | null;
          created_by?: UUID;
          created_at?: string;
        };
        Update: {
          product_id?: UUID;
          source_transaction_id?: UUID | null;
          old_stock?: number;
          change_amount?: number;
          new_stock?: number;
          type?: StockTransactionType;
          notes?: string | null;
          created_by?: UUID;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_logs_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      profiles: {
        Row: ProfileSummary;
        Relationships: [];
      };
      public_catalog_products: {
        Row: PublicCatalogProduct;
        Relationships: [];
      };
    };
    Functions: {
      process_stock_transaction: {
        Args: {
          p_date: ISODateString;
          p_notes: string | null;
          p_product_id: UUID;
          p_quantity: number;
          p_type: StockTransactionType;
        };
        Returns: StockLog;
      };
      record_incoming: {
        Args: {
          p_date: ISODateString;
          p_product_id: UUID;
          p_quantity: number;
          p_supplier_name: string;
        };
        Returns: IncomingItem;
      };
      record_incoming_item: {
        Args: {
          p_date: ISODateString;
          p_product_id: UUID;
          p_quantity: number;
          p_supplier_name: string;
        };
        Returns: IncomingItem;
      };
      record_outgoing: {
        Args: {
          p_date: ISODateString;
          p_product_id: UUID;
          p_quantity: number;
          p_description: string | null;
        };
        Returns: OutgoingItem;
      };
      record_outgoing_item: {
        Args: {
          p_date: ISODateString;
          p_product_id: UUID;
          p_quantity: number;
          p_description: string | null;
        };
        Returns: OutgoingItem;
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
}
