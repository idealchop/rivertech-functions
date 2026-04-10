import { https } from "firebase-functions/v2";
import { db } from "../../config/firebase-admin";
import { BffContext } from "../middleware/auth";
import { validateTierLimit } from "../middleware/subscription";
import { FieldValue } from "firebase-admin/firestore";

export async function handleCustomerAction(action: string, data: any, context: BffContext) {
  // In v3, customers are stored under the business document
  const customerRef = db.collection("businesses").doc(context.businessId).collection("customers");

  switch (action) {
  case "insert": {
    // Check tier limits before insert
    const snapshot = await customerRef.get();
    validateTierLimit(context, "customers", snapshot.size);

    const newDoc = customerRef.doc();
    const finalData = {
      ...data,
      id: newDoc.id,
      businessId: context.businessId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      avatar: data.avatar || (data.name ? data.name[0] : "C"),
    };

    await newDoc.set(finalData);
    return { success: true, id: newDoc.id };
  }
  case "update": {
    if (!data.id) {
      throw new https.HttpsError(
        "invalid-argument",
        "Customer ID is required for update",
      );
    }

    await customerRef.doc(data.id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
  case "delete": {
    if (!data.id) {
      throw new https.HttpsError(
        "invalid-argument",
        "Customer ID is required for delete",
      );
    }

    await customerRef.doc(data.id).delete();
    return { success: true };
  }
  case "inquire": {
    // Basic inquire: list all customers for this business
    // Can be extended with filters later
    const snapshot = await customerRef.orderBy("name").get();
    return {
      success: true,
      data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  }
  default:
    throw new https.HttpsError("invalid-argument", `Unsupported customer action: ${action}`);
  }
}
