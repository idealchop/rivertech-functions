import { https } from "firebase-functions/v2";
import { db } from "../../config/firebase-admin";
import { BffContext } from "../middleware/auth";
import { validateTierLimit } from "../middleware/subscription";

export async function handleStaffAction(action: string, data: any, context: BffContext) {
  const staffRef = db.collection("businesses").doc(context.businessId).collection("staff");

  switch (action) {
  case "insert": {
    // Check tier limits before insert
    const snapshot = await staffRef.get();
    validateTierLimit(context, "staff", snapshot.size);

    const newStaff = await staffRef.add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, id: newStaff.id };
  }
  case "update": {
    await staffRef.doc(data.id).update({
      ...data,
      updatedAt: new Date(),
    });
    return { success: true };
  }
  case "delete": {
    await staffRef.doc(data.id).delete();
    return { success: true };
  }
  case "inquire": {
    const snapshot = await staffRef.get();
    return {
      success: true,
      data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  }
  default:
    throw new https.HttpsError("invalid-argument", `Unsupported staff action: ${action}`);
  }
}
