import * as dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import {
  firebaseProjectId,
  firebaseClientEmail,
  firebasePrivateKey,
  firestoreDbId,
} from "./params";

let appInstance: admin.app.App | null = null;
let dbInstance: admin.firestore.Firestore | null = null;

/**
 * Robust lazy-loader for the Firebase Admin App.
 * @return {admin.app.App} The initialized Firebase Admin App.
 */
function getApp() {
  if (appInstance) return appInstance;

  // Safely check for existing DEFAULT app
  appInstance = admin.apps.find((a) => a?.name === "[DEFAULT]") || null;
  if (appInstance) return appInstance;

  const isDeployed = process.env.FUNCTIONS_EMULATOR !== "true" &&
                    !!process.env.K_SERVICE;

  if (!isDeployed && firebaseProjectId.value()) {
    logger.info("Initializing Firebase Admin SDK with local credentials.");
    appInstance = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseProjectId.value(),
        clientEmail: firebaseClientEmail.value(),
        privateKey: (firebasePrivateKey.value() || "")
          .replace(/\\n/g, "\n"),
      }),
    });
  } else {
    logger.info("Initializing Firebase Admin SDK with default credentials.");
    appInstance = admin.initializeApp();
  }
  return appInstance;
}

/**
 * Lazy-loaded Firestore instance.
 * @return {admin.firestore.Firestore} The Firestore instance.
 */
export const getDb = () => {
  if (dbInstance) return dbInstance;
  const app = getApp();
  const dbId = firestoreDbId.value();
  dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
  return dbInstance;
};

/**
 * Lazy-loaded Auth instance.
 * @return {admin.auth.Auth} The Firebase Auth instance.
 */
export const getAuth = () => admin.auth(getApp());

/**
 * Lazy-loaded AppCheck instance.
 * @return {admin.appCheck.AppCheck} The App Check instance.
 */
export const getAppCheck = () => admin.appCheck(getApp());

/**
 * Proxy-based exports for backward compatibility.
 * These allow 'import { db } from ...' to work while remaining lazy.
 */
export const app = new Proxy({} as admin.app.App, {
  get: (target, prop) => {
    const instance = getApp();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const db = new Proxy({} as admin.firestore.Firestore, {
  get: (target, prop) => {
    const instance = getDb();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get: (target, prop) => {
    const instance = getAuth();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const adminAppCheck = new Proxy({} as admin.appCheck.AppCheck, {
  get: (target, prop) => {
    const instance = getAppCheck();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
