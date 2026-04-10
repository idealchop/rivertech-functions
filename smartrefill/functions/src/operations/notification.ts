import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const addNotification = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, notificationData } = request.data;
  if (!userId || !notificationData) {
    throw new HttpsError(
      "invalid-argument",
      "Missing userId or notificationData",
    );
  }

  try {
    const notificationsRef = db
      .collection("users")
      .doc(userId)
      .collection("notifications");
    const newDocRef = notificationsRef.doc();
    const finalData = {
      ...notificationData,
      id: newDocRef.id,
      timestamp: FieldValue.serverTimestamp(),
      read: false,
    };
    await newDocRef.set(finalData);
    return { success: true, id: newDocRef.id };
  } catch (error) {
    logger.error("Error adding notification:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};
