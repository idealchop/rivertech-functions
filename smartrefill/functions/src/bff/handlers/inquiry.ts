import { https } from "firebase-functions/v2";
import { db } from "../../config/firebase-admin";
import { BffContext } from "../middleware/auth";

interface InquiryParams {
    domain: string;
    filters?: { field: string; operator: any; value: any }[];
    orderBy?: { field: string; direction: "asc" | "desc" };
    limit?: number;
}

export async function handleGlobalInquiry(data: InquiryParams, context: BffContext) {
  const { domain, filters, orderBy, limit } = data;

  // Restricted domains at the BFF level for security
  const allowedDomains = ["staff", "customers", "tanks", "deliveries", "inventory", "expenses"];
  if (!allowedDomains.includes(domain)) {
    throw new https.HttpsError("permission-denied", `Inquiry not allowed for domain: ${domain}`);
  }

  let query: any = db.collection("businesses").doc(context.businessId).collection(domain);

  // Apply dynamic filters
  if (filters && Array.isArray(filters)) {
    filters.forEach((f) => {
      query = query.where(f.field, f.operator, f.value);
    });
  }

  // Apply ordering
  if (orderBy) {
    query = query.orderBy(orderBy.field, orderBy.direction);
  } else {
    // Default ordering fallback
    query = query.orderBy("createdAt", "desc");
  }

  // Apply limit
  if (limit) {
    query = query.limit(limit);
  } else {
    query = query.limit(100); // Guard rails
  }

  const snapshot = await query.get();
  return {
    success: true,
    data: snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
  };
}
