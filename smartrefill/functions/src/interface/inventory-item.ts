import { InventoryLog } from "./inventory-log";

export interface InventoryItem{
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  category: string;
  unit: string; // e.g., 'pcs', 'boxes', 'sets'
  cost?: number; // Cost per unit
  minStockThreshold: number;
  supplier?: string; // Optional
  location?: string; // Optional, e.g., "Main Warehouse", "Truck 1"
  lastRestocked: string; // ISO String Date
  imageUrl?: string | null;
  logs?: InventoryLog[];
}
