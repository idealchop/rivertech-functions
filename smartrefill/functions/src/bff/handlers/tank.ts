import { https } from "firebase-functions/v2";
import { db } from "../../config/firebase-admin";
import { BffContext } from "../middleware/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function handleTankAction(action: string, data: any, context: BffContext) {
  const tankRef = db.collection("businesses").doc(context.businessId).collection("tanks");

  switch (action) {
  case "insert": {
    // In v3, we might also check device/meter constraints
    const newDoc = tankRef.doc();
    const finalData = {
      ...data,
      id: newDoc.id,
      businessId: context.businessId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastActivity: FieldValue.serverTimestamp(),
    };

    await newDoc.set(finalData);
    return { success: true, id: newDoc.id };
  }
  case "update": {
    if (!data.id) throw new https.HttpsError("invalid-argument", "Tank ID is required for update");

    await tankRef.doc(data.id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
  case "delete": {
    if (!data.id) throw new https.HttpsError("invalid-argument", "Tank ID is required for delete");

    await tankRef.doc(data.id).delete();
    return { success: true };
  }
  case "inquire": {
    const snapshot = await tankRef.orderBy("name").get();
    return {
      success: true,
      data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  }
  case "log_activity": {
    if (!data.id) throw new https.HttpsError("invalid-argument", "Tank ID is required for logging");
    const activityRef = tankRef.doc(data.id).collection("activity");
    await activityRef.add({
      ...data.activity,
      timestamp: FieldValue.serverTimestamp(),
    });
    await tankRef.doc(data.id).update({
      lastActivity: FieldValue.serverTimestamp(),
      currentLevel: data.currentLevel || 0,
    });
    return { success: true };
  }
  default:
    throw new https.HttpsError("invalid-argument", `Unsupported tank action: ${action}`);
  }
}
