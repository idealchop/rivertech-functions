import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const addExpense = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { data } = request;
  const { userId, expenseData } = data;
  if (!userId || !expenseData) {
    throw new HttpsError(
      "invalid-argument",
      "Missing userId or expenseData",
    );
  }

  try {
    const expenseRef = db.collection("users").doc(userId).collection("expenses");
    const newDocRef = expenseRef.doc();
    const finalData = {
      ...expenseData,
      id: newDocRef.id,
      createdAt: FieldValue.serverTimestamp(),
    };
    await newDocRef.set(finalData);
    return { success: true, id: newDocRef.id };
  } catch (error) {
    logger.error("Error adding expense:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const updateExpense = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, expenseId, updates } = request.data;
  if (!userId || !expenseId || !updates) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("expenses")
      .doc(expenseId);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    logger.error("Error updating expense:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};
