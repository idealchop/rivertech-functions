import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const addTank = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, tankData } = request.data;
  if (!userId || !tankData) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const tankRef = db.collection("users").doc(userId).collection("tanks").doc();
    const finalData = {
      ...tankData,
      id: tankRef.id,
      createdAt: FieldValue.serverTimestamp(),
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };
    await tankRef.set(finalData);
    return { success: true, id: tankRef.id };
  } catch (error) {
    logger.error("Error adding tank:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const updateTank = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, tankId, updates } = request.data;
  if (!userId || !tankId || !updates) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const tankRef = db.collection("users").doc(userId).collection("tanks").doc(tankId);
    await tankRef.update({
      ...updates,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    logger.error("Error updating tank:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const deleteTank = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, tankId } = request.data;
  if (!userId || !tankId) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db.collection("users").doc(userId).collection("tanks").doc(tankId).delete();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting tank:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const logTankActivity = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, tankId, logData, currentLevelUpdate } = request.data;
  if (!userId || !tankId || !logData) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const tankRef = db.collection("users").doc(userId).collection("tanks").doc(tankId);

    await tankRef.update({
      currentLevel: currentLevelUpdate,
      logs: FieldValue.arrayUnion({
        ...logData,
        recordedAt: FieldValue.serverTimestamp(),
      }),
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    logger.error("Error logging tank activity:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};
