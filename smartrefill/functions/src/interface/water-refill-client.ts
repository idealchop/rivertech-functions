import { Timestamp, FieldValue } from "firebase-admin/firestore";

export interface WaterRefillClientProp {
  name: string;
  email: string;
  phone: number;
  address: string;
  planType: "fixed" | "flowing";
  accountType: "family" | "business";
  businessName: string;
  estimatedContainers: number;
  status: string;
  createdAt: Timestamp | FieldValue;
}
