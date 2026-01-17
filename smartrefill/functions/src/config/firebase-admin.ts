import * as dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

// --------------------------------------------------------
// Initialize Admin SDK (only once)
// --------------------------------------------------------
let app: admin.app.App;
if (admin.apps.length === 0) {
  if (process.env.SMARTREFILL_FIREBASE_PROJECT_ID) {
    logger.info("Initializing Firebase Admin SDK for local development.", { structuredText: true });
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.SMARTREFILL_FIREBASE_PROJECT_ID,
        clientEmail: process.env.SMARTREFILL_FIREBASE_CLIENT_EMAIL,
        privateKey: (
          process.env.SMARTREFILL_FIREBASE_PRIVATE_KEY || ""
        ).replace(/\\n/g, "\n"),
      }),
    });
  } else {
    logger.info(
      "Initializing Firebase Admin SDK for deployed environment.",
      { structuredText: true },
    );
    // Deployed environment: use default credentials
    app = admin.initializeApp();
  }
} else {
  app = admin.app();
  logger.info(
    "Firebase Admin SDK already initialized, using existing app.",
    { structuredText: true },
  );
}

// --------------------------------------------------------
// Optional: Named Firestore database
// --------------------------------------------------------
const dbId = process.env.SMARTREFILL_FIRESTORE_DB; // optional

const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

// --------------------------------------------------------
// Exports
// --------------------------------------------------------
export { app, db };

export const adminAuth = admin.auth(app);
export const adminAppCheck = admin.appCheck(app);
