import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const updateBusinessProfile = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");

  const { userId, profileData } = request.data;
  if (!userId || !profileData) {
    throw new HttpsError("invalid-argument", "Missing userId or profileData");
  }

  try {
    const docRef = db.collection("users").doc(userId).collection("profile").doc("main");
    await docRef.set(profileData, { merge: true });
    return { success: true };
  } catch (error) {
    logger.error("Error updating profile:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const submitPartnerApplication = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");

  const { userId, applicationData } = request.data;
  if (!userId || !applicationData) {
    throw new HttpsError("invalid-argument", "Missing data");
  }

  try {
    const batch = db.batch();

    // Create application record
    const appRef = db.collection("partnerApplications").doc();
    batch.set(appRef, {
      ...applicationData,
      id: appRef.id,
      submittedAt: FieldValue.serverTimestamp(),
    });

    // Update business profile status
    const profileRef = db.collection("users").doc(userId).collection("profile").doc("main");
    batch.set(profileRef, { partnershipStatus: "Applied" }, { merge: true });

    await batch.commit();
    return { success: true };
  } catch (error) {
    logger.error("Error submitting application:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const submitUserFeedback = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");

  const { userId, feedbackData } = request.data;
  if (!userId || !feedbackData) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const docRef = db.collection("users").doc(userId).collection("profile").doc("main");
    await docRef.set({
      userFeedback: {
        ...feedbackData,
        submittedAt: FieldValue.serverTimestamp(),
      },
    }, { merge: true });
    return { success: true };
  } catch (error) {
    logger.error("Error submitting feedback:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};
