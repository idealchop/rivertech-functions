export interface InventoryLog{
  date: string; // ISO String
  type:
      | "Restock"
      | "Manual Deduction"
      | "AI Scan - Add"
      | "AI Scan - Deduct"
      | "Assigned to Customer"
      | "Returned from Customer"
      | "Sale"
      | "Reversal";
  quantityChange: number; // positive for additions, negative for subtractions
  notes?: string;
  relatedCustomerName?: string;
  recordedBy?: string; // Name of the user/staff who made the change
}
