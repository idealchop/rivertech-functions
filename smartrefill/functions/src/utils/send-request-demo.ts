import { logger } from "firebase-functions";
import { brevo, getBrevoApi } from "./brevo-client";
import { RequestDemoProp } from "../interface/request-demo";

export async function sendRequestDemo(data: RequestDemoProp) {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      stationCount,
      requestedDate,
    } = data;
    const emailReceiver = process.env.SUPPORT_EMAIL || "justfer15@gmail.com";
    const nameReceiver = "support";

    // Get the authenticated instance INSIDE the try block
    const api = getBrevoApi();

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Request Demo";
    sendSmtpEmail.to = [{ email: emailReceiver, name: nameReceiver }];
    sendSmtpEmail.templateId = 22;
    sendSmtpEmail.params = {
      name,
      email,
      phone,
      businessName,
      stationCount,
      requestedDate,
    };

    await api.sendTransacEmail(sendSmtpEmail);

    logger.info(`request demo ${email}`);
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
