import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const addCustomPackage = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, packageData } = request.data;
  if (!userId || !packageData) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const pkgRef = db.collection("users").doc(userId).collection("packages").doc();
    const finalData = {
      ...packageData,
      id: pkgRef.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await pkgRef.set(finalData);
    return { success: true, id: pkgRef.id };
  } catch (error) {
    logger.error("Error adding package:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const updateCustomPackage = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, packageId, updates } = request.data;
  if (!userId || !packageId || !updates) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const pkgRef = db.collection("users").doc(userId).collection("packages").doc(packageId);
    await pkgRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    logger.error("Error updating package:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const deleteCustomPackage = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, packageId } = request.data;
  if (!userId || !packageId) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db.collection("users").doc(userId).collection("packages").doc(packageId).delete();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting package:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};
