import { logger } from "firebase-functions";
import { app } from "../config/firebase-admin";
import { brevo, getBrevoApi } from "../utils/brevo-client"; // Change import

export async function sendVerificationEmail(email: string, name: string) {
  try {
    // Fetch the base URL from .env, fallback to a default if necessary
    const baseUrl = process.env.APP_BASE_URL || "https://smartrefill.io";
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
    sendSmtpEmail.subject = "Verify your email for SmartRefill";
    sendSmtpEmail.to = [{ email, name }];
    sendSmtpEmail.templateId = 1;
    sendSmtpEmail.params = {
      name: name,
      verification_link: verificationLink,
    };

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
