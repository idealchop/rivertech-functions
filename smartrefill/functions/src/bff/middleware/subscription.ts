import { https } from "firebase-functions/v2";
import { BffContext } from "./auth";

export const PRICING_LIMITS = {
  Starter: { staff: 0, customers: 20 },
  Grow: { staff: 1, customers: 200 },
  Scale: { staff: 3, customers: 1000000 },
  Enterprise: { staff: 100, customers: 1000000 },
};

export function validateTierLimit(context: BffContext, domain: string, currentCount: number) {
  const limits = (PRICING_LIMITS as any)[context.tier] || PRICING_LIMITS.Starter;
  const limit = limits[domain];

  if (limit !== undefined && currentCount >= limit) {
    throw new https.HttpsError(
      "failed-precondition",
      `Plan limit reached: ${context.tier} allows only ${limit} ${domain}.`
    );
  }
}
