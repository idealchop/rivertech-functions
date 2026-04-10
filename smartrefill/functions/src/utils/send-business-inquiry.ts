import { logger } from "firebase-functions";
import { brevo, getBrevoApi } from "./brevo-client";
import { InquiryProp } from "../interface/inquiries";


export async function sendBusinessInquiry(data: InquiryProp) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      business, // Destructure the object first
      message = "No message provided", // Default value for message
    } = data;

    // Extract business details with fallbacks
    const businessName = (business as any)?.name || "Unknown";
    const businessAddress = (business as any)?.address || "Unknown";

    const emailReceiver = process.env.SUPPORT_EMAIL || "justfer15@gmail.com";
    const name = "support";

    // Get the authenticated instance INSIDE the try block
    const api = getBrevoApi();

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Business Inquiry for Smart Refill";
    sendSmtpEmail.to = [{ email: emailReceiver, name }];
    sendSmtpEmail.templateId = 21;
    sendSmtpEmail.params = {
      firstName,
      lastName,
      email,
      phone,
      company: businessName,
      address: businessAddress,
      message,
    };

    await api.sendTransacEmail(sendSmtpEmail);

    logger.info(`Business Inquiry from ${email}`);
    return { success: true };
  } catch (error: any) {
    logger.error("Brevo send failed (raw)", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.body,
    });
    throw error;
  }
}
