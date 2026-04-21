/**
 * Cloud Functions Entry Point
 */
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { db } from "./config/firebase-admin";

import {
  sendResetPassword,
  sendStaffVerificationEmail,
  sendTeamInvite,
  sendVerificationEmail,
} from "./authentication";

import { brevo, getBrevoApi } from "./utils/brevo-client";

import {
  InquiryProp,
  InviteProp,
  RequestDemoProp,
  TeamInviteProp,
} from "./interface";

import {
  sendBusinessInquiry,
  sendBusinessPlanInquiry,
  sendCollaborationForm,
  sendPartnerApplication,
  sendCustomerRefill,
  sendRequestDemo,
} from "./utils";

import { deleteStaffUser } from "./staff/delete-staff-user";

import { brevoApiKey, enforceAppCheck } from "./config/params";

/**
 * Global runtime options for all functions.
 * Note: enforceAppCheck requires the 'Firebase App Check Verifier' role
 * to be granted to the Cloud Functions service account in IAM.
 */
const runtimeOptions = {
  timeoutSeconds: 120,
  memory: "512MiB" as const,
  invoker: "public" as const,
  cors: ["https://smartrefill.io", "http://localhost:3000"],
  enforceAppCheck: enforceAppCheck.value() === "true",
  consumeAppCheckToken: enforceAppCheck.value() === "true",
  secrets: [brevoApiKey],
  region: "us-central1",
};


export const sendVerificationEmailFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  functions.logger.info("sendVerificationEmailFn called", { structuredText: true });
  const { data } = request;
  const { email, name } = data || {};

  if (!email) {
    functions.logger.info(
      "Missing email in sendVerificationEmailFn request",
      { structuredText: true }
    );
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


export const sendStaffVerificationEmailFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  functions.logger.info("sendStaffVerificationEmailFn called", { structuredText: true });
  const { data } = request;
  const { email, name } = data || {};

  if (!email) {
    functions.logger.info(
      "Missing email in sendStaffVerificationEmailFn request",
      { structuredText: true }
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing email",
    );
  }

  await sendStaffVerificationEmail(email, name || "User");
  return {
    success: true,
    message: "Verification email sent",
  };
});


export const sendTeamInviteFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  functions.logger.info("sendTeamInviteFn called", { structuredText: true });
  const data: TeamInviteProp = request.data;

  if (!data || !data.inviteeEmail || !data.inviterEmail || !data.inviteLink) {
    functions.logger.info(
      "Missing required fields in sendTeamInviteFn request",
      { structuredText: true }
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields (inviteeEmail, inviterEmail, inviteLink)",
    );
  }

  await sendTeamInvite(data);

  return {
    success: true,
    message: "Team invite email sent",
  };
});


export const resetPasswordFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  functions.logger.info("resetPasswordFn called", { structuredText: true });
  const { data } = request;
  const { email } = data || {};

  if (!email) {
    functions.logger.info(
      "Missing email in resetPasswordFn request",
      { structuredText: true }
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing email",
    );
  }

  await sendResetPassword(email);

  return {
    success: true,
    message: "Reset password email sent",
  };
});


export const requestDemoFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  try {
    const data: RequestDemoProp = request.data;
    if (!data || !data.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid email."
      );
    }
    await sendRequestDemo(data);
    return { success: true };
  } catch (error) {
    functions.logger.error("Error in requestDemoFn:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while sending request demo."
    );
  }
});


export const inquiryFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  try {
    const data: InquiryProp = request.data;
    if (!data || !data.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid email."
      );
    }
    await db.collection("inquiries").add({
      ...data,
      status: "new",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    switch (data.inquiry) {
    case "become-partner":
      await sendPartnerApplication(data);
      break;
    case "business":
      await sendBusinessInquiry(data);
      break;
    case "business-plan":
      await sendBusinessPlanInquiry(data);
      break;
    case "collaboration":
      await sendCollaborationForm(data);
      break;
    case "customer-refill":
      await sendCustomerRefill(data);
      break;
    default:
      functions.logger.warn(`Unknown inquiry type: ${data.inquiry}`);
      break;
    }

    return { success: true };
  } catch (error) {
    functions.logger.error("Error in inquiryFn:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing the inquiry."
    );
  }
});


export const createStaffInvitationFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  try {
    const data: InviteProp = request.data;

    if (!data || !data.invitee.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a complete payload"
      );
    }

    // Calculate 3 days from now
    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + 3);

    await db.collection("invites").add({
      ...data,
      status: "pending",
      // Convert JS Date to Firestore Timestamp
      expiredAt: admin.firestore.Timestamp.fromDate(expirationDate),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    functions.logger.error("Error in createStaffInvitationFn:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing the invites."
    );
  }
});
export const deleteStaffUserFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  const { auth, data } = request;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated owners can delete staff."
    );
  }

  try {
    return await deleteStaffUser(data, auth.uid);
  } catch (error: any) {
    functions.logger.error("Error in deleteStaffUserFn:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "An error occurred while deleting staff."
    );
  }
});

export const sendEmailFn = functions.https.onCall({
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  const { auth, data } = request;

  if (!auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can send system emails."
    );
  }

  const { to, subject, htmlContent } = data || {};
  if (!to || !subject || !htmlContent) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required email fields (to, subject, htmlContent)."
    );
  }

  try {
    const api = getBrevoApi();
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: "Smart Refill", email: "no-reply@smartrefill.io" };
    sendSmtpEmail.to = [{ email: to }];

    await api.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error: any) {
    functions.logger.error("Error in sendEmailFn:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "An error occurred while sending email."
    );
  }
});
