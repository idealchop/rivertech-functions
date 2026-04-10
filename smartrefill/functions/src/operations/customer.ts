import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const addCustomer = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");

  const { data } = request;
  const { userId, customerData } = data;

  if (!userId || !customerData) {
    throw new HttpsError("invalid-argument", "Missing userId or customerData");
  }

  try {
    const customerRef = db.collection("users").doc(userId).collection("customers");
    const newDocRef = customerRef.doc();
    const finalData = {
      ...customerData,
      id: newDocRef.id,
      createdAt: FieldValue.serverTimestamp(),
      avatar: customerData.avatar || (customerData.name ? customerData.name[0] : "C"),
    };
    await newDocRef.set(finalData);
    return { success: true, id: newDocRef.id };
  } catch (error) {
    logger.error("Error adding customer:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const updateCustomer = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, customerId, updates } = request.data;
  if (!userId || !customerId || !updates) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("customers")
      .doc(customerId);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    logger.error("Error updating customer:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};
