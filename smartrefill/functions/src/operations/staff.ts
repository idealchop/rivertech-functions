import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const addStaff = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, staffData } = request.data;
  if (!userId || !staffData) throw new HttpsError("invalid-argument", "Missing parameters");

  try {
    const staffRef = db.collection("users").doc(userId).collection("staff");
    const newDocRef = staffRef.doc();
    const finalData = { ...staffData, id: newDocRef.id, createdAt: FieldValue.serverTimestamp() };
    await newDocRef.set(finalData);
    return { success: true, id: newDocRef.id };
  } catch (error) {
    logger.error("Error adding staff:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const updateStaff = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, staffId, updates } = request.data;
  if (!userId || !staffId || !updates) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }
  try {
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("staff")
      .doc(staffId);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    logger.error("Error updating staff:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};
export const addPayrollAdjustment = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, staffId, adjustment } = request.data;
  if (!userId || !staffId || !adjustment) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("staff")
      .doc(staffId);
    await docRef.update({
      payrollAdjustments: FieldValue.arrayUnion({
        ...adjustment,
        id: `adj-${Date.now()}`,
        createdAt: FieldValue.serverTimestamp(),
      }),
    });
    return { success: true };
  } catch (error) {
    logger.error("Error adding payroll adjustment:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const updatePayrollAdjustment = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, staffId, adjustments } = request.data;
  if (!userId || !staffId || !adjustments) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("staff")
      .doc(staffId);
    await docRef.update({ payrollAdjustments: adjustments });
    return { success: true };
  } catch (error) {
    logger.error("Error updating payroll adjustment:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const deletePayrollAdjustment = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, staffId, adjustments } = request.data;
  if (!userId || !staffId || !adjustments) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("staff")
      .doc(staffId);
    await docRef.update({ payrollAdjustments: adjustments });
    return { success: true };
  } catch (error) {
    logger.error("Error deleting payroll adjustment:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const markStaffAsPaid = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, staffId, payout } = request.data;
  if (!userId || !staffId || !payout) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("staff")
      .doc(staffId);
    await docRef.update({
      payoutHistory: FieldValue.arrayUnion({
        ...payout,
        paidAt: FieldValue.serverTimestamp(),
      }),
      payrollAdjustments: [], // Clear adjustments after payment
    });
    return { success: true };
  } catch (error) {
    logger.error("Error marking staff as paid:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};
