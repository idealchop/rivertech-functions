import * as functions from "firebase-functions/v2";
import { db } from "../../config/firebase-admin";

export interface BffContext {
  uid: string;
  businessId: string;
  role: string;
  tier: string;
}

export async function validateAuth(request: functions.https.CallableRequest): Promise<BffContext> {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { businessId } = request.data;
  if (!businessId) {
    throw new functions.https.HttpsError("invalid-argument", "Business ID is required");
  }

  // Verify business membership
  const businessDoc = await db.collection("businesses").doc(businessId).get();
  if (!businessDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Business not found");
  }

  const businessData = businessDoc.data();
  const staffMember = await db
    .collection("businesses")
    .doc(businessId)
    .collection("staff")
    .doc(uid)
    .get();

  if (!staffMember.exists && businessData?.ownerId !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User is not a member of this business",
    );
  }

  return {
    uid,
    businessId,
    role: staffMember.exists ? staffMember.data()?.role : "owner",
    tier: businessData?.subscriptionTier || "Starter",
  };
}
