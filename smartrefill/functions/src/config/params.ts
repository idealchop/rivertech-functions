import { defineString, defineSecret } from "firebase-functions/params";

/**
 * Brevo API Key for sending emails.
 * Uses Cloud Secret Manager.
 */
export const brevoApiKey = defineSecret("SMARTREFILL_BREVO_API_KEY");

/**
 * The base URL of the Smart Refill application.
 * Used for generating verification and password reset links.
 */
export const appBaseUrl = defineString("APP_BASE_URL", {
  default: "https://smartrefill.io",
  description: "The base URL of the application",
});

/**
 * Project configuration for local development only.
 * In production, Admin SDK uses default credentials.
 */
export const firebaseProjectId = defineString("SMARTREFILL_FIREBASE_PROJECT_ID", {
  default: "aquaflow-management-suite",
  description: "Firebase Project ID for local dev cert",
});

export const firebaseClientEmail = defineString("SMARTREFILL_FIREBASE_CLIENT_EMAIL", {
  default: "firebase-adminsdk-fbsvc@aquaflow-management-suite.iam.gserviceaccount.com",
});

export const firebasePrivateKey = defineString("SMARTREFILL_FIREBASE_PRIVATE_KEY", {
  default: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVDjNU/5ZQTWs4\nXUL0oHAYVJjV8M+oKIlwRlnvsqAjn7byRImVAYfnY0r4S05SBV7bdtiERFVfwJ1v\nGNpy4xO3DiNqEfMIjYOrREHfbarLvVmjLoXp3JRtRE2BFpVjPKXrIQ/4j0E0zJkC\n0g5Y5L56gPG/29RYoZ+2tGDquGUrjvSqil+f55b+inGcOGSymlkw9+478JqnXdt6\nrqV2IdZ0Zkd0+KMcMRXKnsBWNKACiD1FRaBaiGg95Q8mtu5v94XiixWIk7VICU0t\nTFew3K/HyokPyMgaBLTABuSsDWtbBxuk4eWAb5BwLjh9NK0UsbWajbV1VL/odN7T\nlc/ir/vhAgMBAAECggEADYM6TZYXFSQTmIpB3+Xsi5Qdv+VjGepE3WgPTq7ZnCkm\nP2vNsjOvk585hG1lRgPFH+2z/reoKrROQWxWH2ytFJ8EQGEssGWN3nijZSMuxOYf\nSm8VBkiwLwCuawm2VMcCfqCib0TjYys6ItqSoOXpy7bFU8CUzU0nqrtK/vRk/ZAG\ncwEKKfLBHLnWHoWjL/txMn2J4dC00tqu+txt4JFeXuRtgz8ibHAI8CcKlYfe9CFm\npUTAGZTgfxMAd6hJGEZW8+US3USiEJeZ+n8nhbNJagSPazFHEoNnbkJ7qFhqRJGL\n1XhvxoFbKtF26VFjYOqZY6iZt2A7TwzWzVPrexBcXQKBgQDMmYKSa39ZRLnFsTCC\n3DpHmQ0wVC6l1f1y5m3KKaHvEgg08DqW9MOpaKGFHYhoGuqbyPbLgsbJVQdCS0t1\nuHeOtemJuVEPBwfq2q0EWAH08umH8+vQmKARDfPvEjQmd9KZCUm1wkgL8gzlqCLW\nLp3sCGF0I5bp6N1gk82CKzv3ZQKBgQC6gHVABog7VdSOYxCDLWtcaKvDOOaADlX6\nOjO/WGGohz/LwnMb7p3viUwxFOlBB1iRyIO6cpBVtwuaAXeGhiqQn8t+EjhZAgj5\nsw9E1R6L2hU9vsBE6YzM5xvqItL76u/PRb1W/PuMivF/Ael3vvxz2I75+fYqkbLh\n357nWYFgzQKBgEA+C1OyUUBUZgh/BH5ybBJDKnL8W9FSicxkMiECRYhtnwoQTDVO\nEYnGAsFrboNRwEy+I0/vdj+NZUQZpE4IZ/H1iKjn+V3AlWnW0/DDOYoSI+W+X1MW\nOVxhhzCQBLP3d7b5xZ0+raSikg4iZx3dcVTFpOP0sNQtfCVxA1xV+vRJAoGAcRB9\nhKIxJt+i6+ts0EnRw4UFVGYDf3CxePCd/IulMNlFuM6aoD1p7BTtZvgJbM36SO8p\nxPe9Pumok+X9w0VFOsZVRInhNTzBmjeOsykMyrYcmIEy6NQ58uLNDoWsKONGHP9n\niPv3uD1nqJrNIjZbsBOColOChE4uBzddi128zKUCgYEAnLlLHA2pjgv54n2lbhJg\ns6unpBwSwiI0CHSFXur9yVgb3qE7J9ut01tkBgGPmkFh5XCZljogM8yJ/2Y1XO6Y\ng0eGfwHVWZQeIOr4Rdugl/beNjtVjlk36qwwifaOLfNWkJsxJjozMTNY7umcUKIl\nz6hNzVysve5cFGvf096IIU4=\n-----END PRIVATE KEY-----\n", // eslint-disable-line max-len
});

/**
 * Optional Firestore Database ID.
 */
export const firestoreDbId = defineString("SMARTREFILL_FIRESTORE_DB", {
  default: "prod-smartrefill",
});

/**
 * Toggle App Check enforcement.
 */
export const enforceAppCheck = defineString("APP_CHECK_ENFORCE", {
  default: "false",
});
