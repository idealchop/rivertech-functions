import { logger } from "firebase-functions";
import { app } from "../config/firebase-admin";
import { brevo, getBrevoApi } from "../utils/brevo-client";
import { getSmartRefillVerificationTemplate } from "../utils/email-templates";

export async function sendStaffVerificationEmail(
  email: string,
  name: string,
) {
  try {
    // Fetch the base URL from .env, fallback to a default if necessary
    const baseUrl = process.env.APP_BASE_URL || "https://smartrefill.io";

    // 1. Generate the raw link from Firebase (this will be the long staging one)
    const rawFirebaseLink = await app.auth().generateEmailVerificationLink(email, {
      url: `${baseUrl}/staff-verified`,
      handleCodeInApp: true,
    });

    // 2. Extract the 'oobCode' (the actual reset token) from the raw link
    const url = new URL(rawFirebaseLink);
    const oobCode = url.searchParams.get("oobCode");

    // 3. RECONSTRUCT the link to point directly to your site
    // This removes the "firebaseapp.com" part entirely
    const verificationLink = `${baseUrl}/staff-verified?oobCode=${oobCode}`;

    // Get the authenticated instance INSIDE the try block
    const api = getBrevoApi();
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    const template = getSmartRefillVerificationTemplate(name, verificationLink);
    sendSmtpEmail.subject = template.subject;
    sendSmtpEmail.htmlContent = template.html;
    sendSmtpEmail.sender = { name: "Smart Refill", email: "no-reply@smartrefill.io" };
    sendSmtpEmail.to = [{ email, name }];

    await api.sendTransacEmail(sendSmtpEmail);

    logger.info(`Verification email sent to ${email}`);
    return { success: true };
  } catch (error: any) {
    logger.error("Brevo send failed (raw)", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.body,
    });
    throw error; //
  }
}
