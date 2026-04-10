import { logger } from "firebase-functions";
import { app } from "../config/firebase-admin";
import { brevo, getBrevoApi } from "../utils/brevo-client";
import { getResetPasswordTemplate } from "../utils/email-templates";

export async function sendResetPassword(email: string) {
  try {
    const baseUrl = process.env.APP_BASE_URL || "https://smartrefill.io";

    // 1. Generate the raw link from Firebase (this will be the long staging one)
    const rawFirebaseLink = await app.auth().generatePasswordResetLink(email, {
      url: `${baseUrl}/reset-password`,
      handleCodeInApp: true,
    });

    // 2. Extract the 'oobCode' (the actual reset token) from the raw link
    const url = new URL(rawFirebaseLink);
    const oobCode = url.searchParams.get("oobCode");

    // 3. RECONSTRUCT the link to point directly to your site
    // This removes the "firebaseapp.com" part entirely
    const customResetLink = `${baseUrl}/reset-password?oobCode=${oobCode}`;

    logger.info(`Sending custom link: ${customResetLink}`);

    // 4. Send to Brevo
    const api = getBrevoApi();
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    // Pass the CUSTOM link here
    const template = getResetPasswordTemplate(customResetLink);

    sendSmtpEmail.subject = template.subject;
    sendSmtpEmail.htmlContent = template.html;
    sendSmtpEmail.sender = { name: "Smart Refill", email: "no-reply@smartrefill.io" };
    sendSmtpEmail.to = [{ email }];

    await api.sendTransacEmail(sendSmtpEmail);

    logger.info(`Reset password email sent to ${email}`);
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
