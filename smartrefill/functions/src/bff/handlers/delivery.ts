import { https } from "firebase-functions/v2";
import { db } from "../../config/firebase-admin";
import { BffContext } from "../middleware/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function handleDeliveryAction(action: string, data: any, context: BffContext) {
  const deliveryRef = db.collection("businesses").doc(context.businessId).collection("deliveries");

  switch (action) {
  case "insert": {
    const newDoc = deliveryRef.doc();
    const finalData = {
      ...data,
      id: newDoc.id,
      businessId: context.businessId,
      status: data.status || "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await newDoc.set(finalData);
    return { success: true, id: newDoc.id };
  }
  case "update": {
    if (!data.id) {
      throw new https.HttpsError(
        "invalid-argument",
        "Delivery ID is required for update",
      );
    }

    await deliveryRef.doc(data.id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
  case "delete": {
    if (!data.id) {
      throw new https.HttpsError(
        "invalid-argument",
        "Delivery ID is required for delete",
      );
    }

    await deliveryRef.doc(data.id).delete();
    return { success: true };
  }
  case "inquire": {
    // Advanced inquire with status filtering
    let query: any = deliveryRef;
    if (data.status) {
      query = query.where("status", "==", data.status);
    }
    if (data.customerId) {
      query = query.where("customerId", "==", data.customerId);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    return {
      success: true,
      data: snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
    };
  }
  default:
    throw new https.HttpsError("invalid-argument", `Unsupported delivery action: ${action}`);
  }
}
