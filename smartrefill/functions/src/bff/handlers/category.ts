import { db } from "../../config/firebase-admin";
import { BffContext } from "../middleware/auth";
import { FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

export const handleCategoryAction = async (action: string, data: any, context: BffContext) => {
  const { businessId } = context;
  const categoryRef = db.collection("businesses").doc(businessId).collection("expenseCategories");

  switch (action) {
  case "insert": {
    const newDoc = categoryRef.doc();
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
    if (!id) throw new functions.https.HttpsError("invalid-argument", "Missing category ID");
    await categoryRef.doc(id).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
  case "delete": {
    const { id } = data;
    if (!id) throw new functions.https.HttpsError("invalid-argument", "Missing category ID");
    await categoryRef.doc(id).delete();
    return { success: true };
  }
  case "inquire": {
    const snapshot = await categoryRef.orderBy("name", "asc").get();
    return {
      success: true,
      data: snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
    };
  }
  default:
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Unsupported category action: ${action}`,
    );
  }
};
