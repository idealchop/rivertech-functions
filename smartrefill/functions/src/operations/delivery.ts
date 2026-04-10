import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const addDelivery = async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { data } = request;
  const { userId, deliveryData } = data;

  if (!userId || !deliveryData) {
    throw new HttpsError("invalid-argument", "Missing userId or deliveryData.");
  }

  try {
    const deliveryRef = db.collection("users").doc(userId).collection("deliveries");
    const newDocRef = deliveryRef.doc();

    const finalData = {
      ...deliveryData,
      id: newDocRef.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      status: deliveryData.status || "Pending",
      paymentStatus: deliveryData.paymentStatus || "Pending",
    };

    await newDocRef.set(finalData);
    return { success: true, id: newDocRef.id };
  } catch (error) {
    logger.error("Error adding delivery:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const updateDelivery = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");

  const { userId, deliveryId, updates } = request.data;
  if (!userId || !deliveryId || !updates) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const docRef = db.collection("users").doc(userId).collection("deliveries").doc(deliveryId);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    logger.error("Error updating delivery:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};
