import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const addInventoryItem = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, itemData } = request.data;
  if (!userId || !itemData) throw new HttpsError("invalid-argument", "Missing parameters");

  try {
    const invRef = db.collection("users").doc(userId).collection("inventory");
    const newDocRef = invRef.doc();
    const finalData = { ...itemData, id: newDocRef.id, createdAt: FieldValue.serverTimestamp() };
    await newDocRef.set(finalData);
    return { success: true, id: newDocRef.id };
  } catch (error) {
    logger.error("Error adding inventory item:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const updateInventoryItem = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, itemId, updates } = request.data;
  if (!userId || !itemId || !updates) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    await db
      .collection("users")
      .doc(userId)
      .collection("inventory")
      .doc(itemId)
      .update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });
    return { success: true };
  } catch (error) {
    logger.error("Error updating inventory item:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const deleteInventoryItem = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, itemId } = request.data;
  if (!userId || !itemId) throw new HttpsError("invalid-argument", "Missing parameters");

  try {
    await db.collection("users").doc(userId).collection("inventory").doc(itemId).delete();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting inventory item:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const assignItemsToCustomer = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, customerId, customerName, items, recordedBy } = request.data;
  if (!userId || !customerId || !items) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const batch = db.batch();
    const invRef = db.collection("users").doc(userId).collection("inventory");
    const assignmentRef = db
      .collection("users")
      .doc(userId)
      .collection("inventoryAssignments");

    for (const item of items) {
      const assignmentDoc = assignmentRef.doc();
      batch.set(assignmentDoc, {
        id: assignmentDoc.id,
        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,
        customerId,
        customerName,
        quantityAssigned: item.count,
        date: new Date().toISOString(),
        createdAt: FieldValue.serverTimestamp(),
      });

      const itemRef = invRef.doc(item.inventoryItemId);
      batch.update(itemRef, {
        quantity: FieldValue.increment(-item.count),
        logs: FieldValue.arrayUnion({
          date: new Date().toISOString(),
          type: "Assigned to Customer",
          quantityChange: -item.count,
          relatedCustomerName: customerName,
          recordedBy: recordedBy || "System",
        }),
      });
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    logger.error("Error assigning items to customer:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const updateInventoryAssignment = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const {
    userId,
    assignmentId,
    inventoryItemId,
    diff,
    newQuantity,
    customerName,
    recordedBy,
  } = request.data;

  try {
    const batch = db.batch();
    const assignmentRef = db
      .collection("users")
      .doc(userId)
      .collection("inventoryAssignments")
      .doc(assignmentId);
    const itemRef = db
      .collection("users")
      .doc(userId)
      .collection("inventory")
      .doc(inventoryItemId);

    batch.update(assignmentRef, { quantityAssigned: newQuantity });
    batch.update(itemRef, {
      quantity: FieldValue.increment(-diff),
      logs: FieldValue.arrayUnion({
        date: new Date().toISOString(),
        type: "Manual Adjustment",
        quantityChange: -diff,
        relatedCustomerName: customerName,
        recordedBy: recordedBy || "System",
      }),
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    logger.error("Error updating inventory assignment:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};

export const deleteInventoryAssignment = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, assignmentId, inventoryItemId, quantity, recordedBy } = request.data;

  try {
    const batch = db.batch();
    batch.delete(
      db
        .collection("users")
        .doc(userId)
        .collection("inventoryAssignments")
        .doc(assignmentId),
    );
    batch.update(
      db
        .collection("users")
        .doc(userId)
        .collection("inventory")
        .doc(inventoryItemId),
      {
        quantity: FieldValue.increment(quantity),
        logs: FieldValue.arrayUnion({
          date: new Date().toISOString(),
          type: "Returned from Customer",
          quantityChange: quantity,
          recordedBy: recordedBy || "System",
        }),
      },
    );

    await batch.commit();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting inventory assignment:", error);
    throw new HttpsError("internal", "Internal error.");
  }
};
