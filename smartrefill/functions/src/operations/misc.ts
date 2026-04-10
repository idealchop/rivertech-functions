import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config/firebase-admin";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";

export const deleteDelivery = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, deliveryId } = request.data;
  if (!userId || !deliveryId) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db.collection("users").doc(userId).collection("deliveries").doc(deliveryId).delete();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting delivery:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const deleteCustomer = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, customerId } = request.data;
  if (!userId || !customerId) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db.collection("users").doc(userId).collection("customers").doc(customerId).delete();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting customer:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const deleteExpense = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, expenseId } = request.data;
  if (!userId || !expenseId) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db.collection("users").doc(userId).collection("expenses").doc(expenseId).delete();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting expense:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const markNotificationsAsRead = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, notificationIds } = request.data;
  if (!userId || !notificationIds) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const batch = db.batch();
    const notifRef = db.collection("users").doc(userId).collection("notifications");
    notificationIds.forEach((id: string) => {
      batch.update(notifRef.doc(id), { read: true });
    });
    await batch.commit();
    return { success: true };
  } catch (error) {
    logger.error("Error marking notifications as read:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const addItemCategory = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, name } = request.data;
  if (!userId || !name) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const docRef = db.collection("users").doc(userId).collection("itemCategories").doc();
    await docRef.set({
      id: docRef.id,
      name,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    logger.error("Error adding item category:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const updateItemCategory = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, categoryId, name } = request.data;
  if (!userId || !categoryId || !name) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db
      .collection("users")
      .doc(userId)
      .collection("itemCategories")
      .doc(categoryId)
      .update({ name });
    return { success: true };
  } catch (error) {
    logger.error("Error updating item category:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const deleteItemCategory = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, categoryId } = request.data;
  if (!userId || !categoryId) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db.collection("users").doc(userId).collection("itemCategories").doc(categoryId).delete();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting item category:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const addOrderItem = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, itemData } = request.data;
  if (!userId || !itemData) throw new HttpsError("invalid-argument", "Missing data");

  try {
    const docRef = db.collection("users").doc(userId).collection("orderItems").doc();
    await docRef.set({
      ...itemData,
      id: docRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    logger.error("Error adding order item:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const updateOrderItem = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, itemId, updates } = request.data;
  if (!userId || !itemId || !updates) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db.collection("users").doc(userId).collection("orderItems").doc(itemId).update(updates);
    return { success: true };
  } catch (error) {
    logger.error("Error updating order item:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};

export const deleteOrderItem = async (request: CallableRequest) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const { userId, itemId } = request.data;
  if (!userId || !itemId) throw new HttpsError("invalid-argument", "Missing data");

  try {
    await db.collection("users").doc(userId).collection("orderItems").doc(itemId).delete();
    return { success: true };
  } catch (error) {
    logger.error("Error deleting order item:", error);
    throw new HttpsError("internal", "Internal Error");
  }
};
