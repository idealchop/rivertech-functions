import { logger } from "firebase-functions";
import { brevo, getBrevoApi } from "./brevo-client";
import { InquiryProp } from "../interface";

export async function sendCustomerRefill(data: InquiryProp) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      business, // Destructure the object first
    } = data;

    const businessName = (business as any)?.name || "N/A";
    const address = (business as any)?.address || "N/A";
    const planType = (business as any)?.planType || "N/A";
    const accountType = (business as any)?.accountType || "N/A";
    const estimatedContainers = (business as any)?.estimatedContainers || "N/A";

    const supportEmail = process.env.SUPPORT_EMAIL || "justfer15@gmail.com";
    const supportName = "support";

    const api = getBrevoApi();

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Water Refill Client Inquiry";
    sendSmtpEmail.to = [{ email: supportEmail, name: supportName }];
    sendSmtpEmail.templateId = 24;

    sendSmtpEmail.params = {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      address,
      planType,
      accountType,
      businessName: businessName || "N/A", // Business name is optional for 'family' account type
      estimatedContainers,
    };

    await api.sendTransacEmail(sendSmtpEmail);

    logger.info(`Water refill client inquiry email sent to ${supportEmail} for ${name}`);
    return { success: true };
  } catch (error: any) {
    logger.error("Brevo send failed for water refill client inquiry", {
      message: error.message,
      stack: error.stack,
      body: error.response?.body,
    });
    return { success: false, error: error.message };
  }
}
