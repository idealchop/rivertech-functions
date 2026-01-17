/**
 * Cloud Functions Entry Point
 */
import * as functions from "firebase-functions/v2";
import { logger } from "firebase-functions";

// --------------------------------------------------------
// Firebase Admin (initialize once via import side-effect)
// --------------------------------------------------------
import "./config/firebase-admin";

// --------------------------------------------------------
// Feature Imports
// --------------------------------------------------------
import { sendVerificationEmail } from "./authentication/send-verification-email";

// --------------------------------------------------------
// Region & Runtime Options
// --------------------------------------------------------
const runtimeOptions = {
  enforceAppCheck: true,
  consumeAppCheckToken: true,
};

// --------------------------------------------------------
// SEND EMAIL VERIFICATION (Callable Function)
// --------------------------------------------------------
/**
 * A callable Cloud Function that sends a verification email to a user.
 *
 * This function is triggered by an HTTPS call from a client application.
 * It uses App Check to ensure that requests are coming from a valid app.
 *
 * @param {functions.https.CallableRequest} request - The request object from the client.
 * @param {object} request.data - The data sent from the client.
 * @param {string} request.data.email - The email address to send the verification link to.
 * @param {string} [request.data.name] - The name of the user, used for personalizing the email.
 * @returns {Promise<{
 *            success: boolean,
 *            message: string
 * }>} A promise that resolves with a success message.
 * @throws {
 *  functions.https.HttpsError
 * } Throws an error if the email is missing or if any other issue occurs.
 */
export const sendVerificationEmailFn = functions.https.onCall(
  {
    region: "us-central1",
    secrets: ["SMARTREFILL_BREVO_API_KEY"],
    ...runtimeOptions,
  },
  async (request: functions.https.CallableRequest) => {
    logger.info("sendVerificationEmailFn called", { structuredText: true });
    const { data } = request;
    // ----------------------------------------------------
    // App Check is enforced automatically
    // Auth is OPTIONAL unless you enforce it
    // ----------------------------------------------------

    const { email, name } = data || {};

    if (!email) {
      logger.error("Missing email in sendVerificationEmailFn request", { structuredText: true });
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing email",
      );
    }

    await sendVerificationEmail(email, name || "User");

    return {
      success: true,
      message: "Verification email sent",
    };
  });
