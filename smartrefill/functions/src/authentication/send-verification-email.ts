import { logger } from "firebase-functions";
import { app } from "../config/firebase-admin";
import { brevo, getBrevoApi } from "../utils/brevo-client";
import { getSmartRefillVerificationTemplate } from "../utils/email-templates";
import { appBaseUrl } from "../config/params";

export async function sendVerificationEmail(email: string, name: string) {
  try {
    // Fetch the base URL from params, fallback to a default if necessary
    const baseUrl = appBaseUrl.value();
    const actionCodeSettings = {
      url: `${baseUrl}/verified?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };

    const verificationLink = await app.auth().generateEmailVerificationLink(
      email,
      actionCodeSettings,
    );


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
