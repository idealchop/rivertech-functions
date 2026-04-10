import { https } from "firebase-functions/v2";
import { db } from "../../config/firebase-admin";
import { BffContext } from "../middleware/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function handleInventoryAction(action: string, data: any, context: BffContext) {
  const inventoryRef = db.collection("businesses").doc(context.businessId).collection("inventory");

  switch (action) {
  case "insert": {
    const newDoc = inventoryRef.doc();
    const finalData = {
      ...data,
      id: newDoc.id,
      businessId: context.businessId,
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
        "Inventory Item ID is required for update",
      );
    }

    await inventoryRef.doc(data.id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
  case "delete": {
    if (!data.id) {
      throw new https.HttpsError(
        "invalid-argument",
        "Inventory Item ID is required for delete",
      );
    }

    await inventoryRef.doc(data.id).delete();
    return { success: true };
  }
  case "inquire": {
    const snapshot = await inventoryRef.orderBy("name").get();
    return {
      success: true,
      data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  }
  case "assign_to_customer": {
    if (!data.itemId || !data.customerId) {
      throw new https.HttpsError(
        "invalid-argument",
        "itemId and customerId are required for assignment",
      );
    }
    const assignmentRef = db
      .collection("businesses")
      .doc(context.businessId)
      .collection("inventoryAssignments");
    await assignmentRef.add({
      itemId: data.itemId,
      customerId: data.customerId,
      quantity: data.quantity || 1,
      assignedAt: FieldValue.serverTimestamp(),
      status: "active",
    });
    return { success: true };
  }
  default:
    throw new https.HttpsError("invalid-argument", `Unsupported inventory action: ${action}`);
  }
}
