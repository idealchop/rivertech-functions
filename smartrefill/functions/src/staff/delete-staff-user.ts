import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { getDb } from "../config/firebase-admin";

interface DeleteStaffPayload {
  staffUid?: string | null;
  staffDocId: string;
}

/**
 * Deletes a staff member's profile and removes them from the owner's staff list.
 * @param {DeleteStaffPayload} data The staff UID and document ID to delete.
 * @param {string} ownerId The UID of the owner who owns the staff member.
 * @return {Promise<{success: boolean}>} Result of the operation.
 */
export async function deleteStaffUser(data: DeleteStaffPayload, ownerId: string) {
  const { staffUid, staffDocId } = data;
  const db = getDb();

  try {
    const batch = db.batch();

    // 1. Remove from owner's staff subcollection
    const staffRef = db.collection("users").doc(ownerId).collection("staff").doc(staffDocId);
    batch.delete(staffRef);

    // 2. If staffUid is provided, remove their main profile as well
    if (staffUid) {
      const profileRef = db.collection("users").doc(staffUid).collection("profile").doc("main");
      batch.delete(profileRef);

      const userRef = db.collection("users").doc(staffUid);
      batch.delete(userRef);

      // 3. Disable the user in Firebase Auth (don't hard delete yet for safety)
      try {
        await admin.auth().updateUser(staffUid, { disabled: true });
        logger.info(`Disabled Auth user for staff: ${staffUid}`);
      } catch (authError) {
        logger.error(`Failed to disable Auth user: ${staffUid}`, authError);
      }
    }

    await batch.commit();
    logger.info(`Successfully deleted staff record: ${staffDocId} for owner: ${ownerId}`);

    return { success: true };
  } catch (error) {
    logger.error("Error deleting staff member:", error);
    throw error;
  }
}
