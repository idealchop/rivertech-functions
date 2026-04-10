import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { db, adminAuth } from "../config/firebase-admin"; // Using your config exports
import { InventoryItem } from "../interface/inventory-item";
import { InventoryLog } from "../interface/inventory-log";

export const onUserCreate = async (user: admin.auth.UserRecord) => {
  const { uid, email, displayName, photoURL } = user;

  if (!email) {
    functions.logger.warn(`No email found for user ${uid}, skipping initialization.`);
    return;
  }

  try {
    // 1. Check for invitations (If invited, they aren't an "Owner")
    const inviteQuery = await db
      .collection("invites")
      .where("email", "==", email)
      .where("status", "==", "Pending")
      .limit(1)
      .get();

    if (!inviteQuery.empty) {
      functions.logger.info(`User ${uid} is invited. Skipping default owner setup.`);
      return;
    }

    // 2. Check for existing document to prevent overwrites on retries
    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      functions.logger.info(`User doc already exists for ${uid}`);
      return;
    }

    const finalName = displayName || "New User";

    // 3. Assign owner role via Custom Claims
    await adminAuth.setCustomUserClaims(uid, { role: "owner" });

    // 4. Initialize Main Batch for Firestore
    const batch = db.batch();

    // Create User Document
    batch.set(userDocRef, {
      uid,
      email,
      displayName: finalName,
      role: "owner",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create Profile Subdocument
    const profileRef = userDocRef.collection("profile").doc("main");
    batch.set(profileRef, {
      ownerName: finalName,
      email,
      phone: "",
      address: "",
      stationAddress: "",
      logo: photoURL || null,
      onboardingComplete: false,
      businessName: `${finalName}'s Station`,
      subscriptionStatus: "active",
      priceId: "price_executive_plan",
      standardPricePerBottle: 50,
      uiConfig: { dashboard: "StandardDashboard" },
      getStartedGuide: { dismissed: false, completedSteps: [] },
    });

    // 5. Initialize Inventory Items
    const inventoryRef = userDocRef.collection("inventory");
    const todayISO = new Date().toISOString();

    const defaults: Omit<InventoryItem, "id" | "logs">[] = [
      {
        name: "Slim Container",
        quantity: 100,
        category: "Containers",
        unit: "pcs",
        minStockThreshold: 20,
        cost: 150,
        lastRestocked: todayISO,
      },
      {
        name: "Round Container",
        quantity: 100,
        category: "Containers",
        unit: "pcs",
        minStockThreshold: 20,
        cost: 150,
        lastRestocked: todayISO,
      },
    ];

    defaults.forEach((item) => {
      const itemRef = inventoryRef.doc();
      const log: InventoryLog = {
        date: todayISO,
        type: "Restock",
        quantityChange: item.quantity,
        notes: "Initial stock",
        recordedBy: "System",
      };
      batch.set(itemRef, { ...item, logs: [log] });
    });

    // Commit all Firestore operations at once
    await batch.commit();

    functions.logger.log(`Successfully initialized owner account, 
      profile, and inventory for ${uid}`);
  } catch (error) {
    functions.logger.error("Error in onUserCreate trigger:", error);
    // Throwing ensures the function retries if it fails due to a transient error
    throw error;
  }
};
