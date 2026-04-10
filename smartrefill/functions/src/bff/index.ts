import * as functions from "firebase-functions/v2";
import { validateAuth } from "./middleware/auth";
import { handleStaffAction } from "./handlers/staff";
import { handleCustomerAction } from "./handlers/customer";
import { handleTankAction } from "./handlers/tank";
import { handleInventoryAction } from "./handlers/inventory";
import { handleDeliveryAction } from "./handlers/delivery";
import { handleExpenseAction } from "./handlers/expense";
import { handleCategoryAction } from "./handlers/category";
import { handleGlobalInquiry } from "./handlers/inquiry";

export const smartrefillBff = functions.https.onCall({
  region: "us-central1",
  enforceAppCheck: true,
}, async (request: functions.https.CallableRequest) => {
  const context = await validateAuth(request);
  const { domain, action, data } = request.data;

  switch (domain) {
  case "staff":
    return handleStaffAction(action, data, context);
  case "customer":
    return handleCustomerAction(action, data, context);
  case "tank":
    return handleTankAction(action, data, context);
  case "inventory":
    return handleInventoryAction(action, data, context);
  case "delivery":
    return handleDeliveryAction(action, data, context);
  case "expenses":
    return handleExpenseAction(action, data, context);
  case "expenseCategories":
    return handleCategoryAction(action, data, context);
  case "global_inquire":
    return handleGlobalInquiry(data, context);
  default:
    throw new functions.https.HttpsError("invalid-argument", `Unsupported domain: ${domain}`);
  }

  return { success: false, error: "Not implemented" };
});
