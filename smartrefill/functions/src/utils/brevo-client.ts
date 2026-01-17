import * as brevo from "@getbrevo/brevo";
import { logger } from "firebase-functions";


/**
 * Gets the authenticated Brevo API instance.
 * This must be called inside the function execution block to ensure
 * the Secret (SMARTREFILL_BREVO_API_KEY) is available.
 * @return {brevo.TransactionalEmailsApi} The authenticated Brevo API instance.
 */
export const getBrevoApi = (): brevo.TransactionalEmailsApi => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    logger.error("Brevo API key missing: SMARTREFILL_BREVO_API_KEY not set");
    throw new Error("Brevo API key not configured");
  }

  const api = new brevo.TransactionalEmailsApi();

  // Attach API key exactly as required by Brevo
  api.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    apiKey,
  );

  return api;
};

/**
 * Re-exports the Brevo SDK for direct access to other Brevo functionalities.
 * @see https://github.com/getbrevo/brevo-ts-sdk
 */
export { brevo };
