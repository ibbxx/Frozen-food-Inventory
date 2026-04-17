export type UUID = string;
export type ISODateString = string;
export type UserRole = "admin" | "staff";

export interface UserProfile {
  id: UUID;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: UUID;
  product_name: string;
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
  created_at: string;
}

export interface OutgoingItem {
  id: UUID;
  date: ISODateString;
  product_id: UUID;
  quantity: number;
  description: string | null;
  created_at: string;
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
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          email?: string;
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
          current_stock?: number;
          min_stock?: number;
          created_at?: string;
        };
        Update: {
          product_name?: string;
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
          created_at?: string;
        };
        Update: {
          date?: ISODateString;
          product_id?: UUID;
          quantity?: number;
          supplier_name?: string;
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
          created_at?: string;
        };
        Update: {
          date?: ISODateString;
          product_id?: UUID;
          quantity?: number;
          description?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: {
      record_incoming_item: {
        Args: {
          p_date: ISODateString;
          p_product_id: UUID;
          p_quantity: number;
          p_supplier_name: string;
        };
        Returns: IncomingItem;
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
