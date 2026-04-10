import { db } from "../../config/firebase-admin";
import { BffContext } from "../middleware/auth";
import { FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

export const handleExpenseAction = async (action: string, data: any, context: BffContext) => {
  const { businessId } = context;
  const expenseRef = db.collection("businesses").doc(businessId).collection("expenses");

  switch (action) {
  case "insert": {
    const newDoc = expenseRef.doc();
    const finalData = {
      ...data,
      id: newDoc.id,
      businessId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await newDoc.set(finalData);
    return { success: true, id: newDoc.id };
  }
  case "update": {
    const { id, ...updates } = data;
    if (!id) throw new functions.https.HttpsError("invalid-argument", "Missing expense ID");
    await expenseRef.doc(id).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
  case "delete": {
    const { id } = data;
    if (!id) throw new functions.https.HttpsError("invalid-argument", "Missing expense ID");
    await expenseRef.doc(id).delete();
    return { success: true };
  }
  case "inquire": {
    const snapshot = await expenseRef.orderBy("date", "desc").get();
    return {
      success: true,
      data: snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
    };
  }
  default:
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Unsupported expense action: ${action}`,
    );
  }
};
