import { logger } from "firebase-functions";
import { brevo, getBrevoApi } from "./brevo-client";
import { InquiryProp } from "../interface";

export async function sendPartnerApplication(data: InquiryProp) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      business, // Destructure the object first
    } = data;


    // Extract business details with fallbacks
    const stationName = (business as any)?.stationName || "Unknown";
    const address = (business as any)?.address || "Unknown";
    const coordinates = (business as any)?.coordinates || null;
    const waterTypes = (business as any)?.waterTypes || [];
    const hasPermits = (business as any)?.hasPermits || "Unknown";
    const stationAge = (business as any)?.stationAge || "Unknown";
    const deliveryVehicles = (business as any)?.deliveryVehicles || [];
    const productionCapacity = (business as any)?.productionCapacity || "Unknown";
    const preferredClients = (business as any)?.preferredClients || [];
    const providesContainers = (business as any)?.providesContainers || "Unknown";
    const providesDispensers = (business as any)?.providesDispensers || "Unknown";
    const onboardingSchedule = (business as any)?.onboardingSchedule || "Unknown";


    const supportEmail = process.env.SUPPORT_EMAIL || "justfer15@gmail.com";
    const name = "support";

    const api = getBrevoApi();

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Become Partner";
    sendSmtpEmail.to = [{ email: supportEmail, name }];
    sendSmtpEmail.templateId = 25;

    sendSmtpEmail.params = {
      firstName,
      lastName,
      email,
      phone,
      stationName,
      address,
      latitude: coordinates?.lat ?? "N/A",
      longitude: coordinates?.lng ?? "N/A",
      waterTypes: waterTypes.join(", "), // Better for email templates if it's an array
      hasPermits,
      stationAge,
      deliveryVehicles: deliveryVehicles.join(", "),
      productionCapacity,
      preferredClients: preferredClients.join(", "),
      providesContainers,
      providesDispensers,
      onboardingSchedule,
    };

    await api.sendTransacEmail(sendSmtpEmail);

    logger.info(`Partner application email sent to ${email} for ${stationName}`);
    return { success: true };
  } catch (error: any) {
    // Log more specific error details from Brevo if available
    logger.error("Brevo send failed", {
      message: error.message,
      stack: error.stack,
      body: error.response?.body,
    });
    return { success: false, error: error.message };
  }
}
