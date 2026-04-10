/**
 * Cloud Functions Entry Point
 */
import * as functions from "firebase-functions/v2";
import * as functionv1 from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { db } from "./config/firebase-admin";

import {
  onUserCreate as onUserCreateFn,
  sendResetPassword,
  sendStaffVerificationEmail,
  sendTeamInvite,
  sendVerificationEmail,
} from "./authentication";

import {
  InquiryProp,
  InviteProp,
  RequestDemoProp,
  TeamInviteProp,
} from "./interface";

import {
  sendBusinessInquiry,
  sendBusinessPlanInquiry,
  sendCollaborationForm,
  sendPartnerApplication,
  sendCustomerRefill,
  sendRequestDemo,
} from "./utils";

import { addDelivery, updateDelivery } from "./operations/delivery";
import { addCustomer, updateCustomer } from "./operations/customer";
import { addExpense, updateExpense } from "./operations/expense";
import { addNotification } from "./operations/notification";
import { addStaff, updateStaff,
  addPayrollAdjustment,
  updatePayrollAdjustment,
  deletePayrollAdjustment,
  markStaffAsPaid,
} from "./operations/staff";
import { addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  assignItemsToCustomer,
  updateInventoryAssignment,
  deleteInventoryAssignment,
} from "./operations/inventory";

import {
  updateBusinessProfile,
  submitPartnerApplication,
  submitUserFeedback,
} from "./operations/profile";
import {
  addCustomPackage,
  updateCustomPackage,
  deleteCustomPackage,
} from "./operations/package";
import {
  addTank,
  updateTank,
  deleteTank,
  logTankActivity,
} from "./operations/tank";
import {
  deleteDelivery,
  deleteCustomer,
  deleteExpense,
  markNotificationsAsRead,
  addItemCategory,
  updateItemCategory,
  deleteItemCategory,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
} from "./operations/misc";
import { smartrefillBff } from "./bff";

// region & App Check
const regFunctions = functionv1.region("us-central1");

const runtimeOptions = {
  enforceAppCheck: true,
  consumeAppCheckToken: true,
};

export const onUserCreate = regFunctions.auth.user().onCreate((user: admin.auth.UserRecord) => {
  return onUserCreateFn(user);
});


export const sendVerificationEmailFn = functions.https.onCall({
  region: "us-central1",
  secrets: ["SMARTREFILL_BREVO_API_KEY"],
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  functions.logger.info("sendVerificationEmailFn called", { structuredText: true });
  const { data } = request;
  const { email, name } = data || {};

  if (!email) {
    functions.logger.info(
      "Missing email in sendVerificationEmailFn request",
      { structuredText: true }
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing email",
    );
  }

  await sendVerificationEmail(email, name || "User");

  return {
    success: true,
    message: "Verification email sent",
  };
});


export const sendStaffVerificationEmailFn = functions.https.onCall({
  region: "us-central1",
  secrets: ["SMARTREFILL_BREVO_API_KEY"],
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  functions.logger.info("sendStaffVerificationEmailFn called", { structuredText: true });
  const { data } = request;
  const { email, name } = data || {};

  if (!email ) {
    functions.logger.info(
      "Missing email in sendStaffVerificationEmailFn request",
      { structuredText: true }
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing email",
    );
  }

  await sendStaffVerificationEmail(email, name || "User");
  return {
    success: true,
    message: "Verification email sent",
  };
});


export const sendTeamInviteFn = functions.https.onCall({
  region: "us-central1",
  secrets: ["SMARTREFILL_BREVO_API_KEY"],
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  functions.logger.info("sendTeamInviteFn called", { structuredText: true });
  const data: TeamInviteProp = request.data;

  if (!data || !data.inviteeEmail || !data.inviterEmail || !data.inviteLink) {
    functions.logger.info(
      "Missing required fields in sendTeamInviteFn request",
      { structuredText: true }
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields (inviteeEmail, inviterEmail, inviteLink)",
    );
  }

  await sendTeamInvite(data);

  return {
    success: true,
    message: "Team invite email sent",
  };
});


export const resetPasswordFn = functions.https.onCall({
  region: "us-central1",
  secrets: ["SMARTREFILL_BREVO_API_KEY"],
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  functions.logger.info("resetPasswordFn called", { structuredText: true });
  const { data } = request;
  const { email } = data || {};

  if (!email) {
    functions.logger.info(
      "Missing email in resetPasswordFn request",
      { structuredText: true }
    );
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing email",
    );
  }

  await sendResetPassword(email);

  return {
    success: true,
    message: "Reset password email sent",
  };
});


export const requestDemoFn = functions.https.onCall({
  region: "us-central1",
  secrets: ["SMARTREFILL_BREVO_API_KEY"],
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  try {
    const data: RequestDemoProp = request.data;
    if (!data || !data.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid email."
      );
    }
    await sendRequestDemo(data);
    return { success: true };
  } catch (error) {
    functions.logger.error("Error in requestDemoFn:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while sending request demo."
    );
  }
});


export const inquiryFn = functions.https.onCall({
  region: "us-central1",
  secrets: ["SMARTREFILL_BREVO_API_KEY"],
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  try {
    const data: InquiryProp = request.data;
    if (!data || !data.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid email."
      );
    }
    await db.collection("inquiries").add({
      ...data,
      status: "new",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    switch (data.inquiry) {
    case "become-partner":
      await sendPartnerApplication(data);
      break;
    case "business":
      await sendBusinessInquiry(data);
      break;
    case "business-plan":
      await sendBusinessPlanInquiry(data);
      break;
    case "collaboration":
      await sendCollaborationForm(data);
      break;
    case "customer-refill":
      await sendCustomerRefill(data);
      break;
    default:
      functions.logger.warn(`Unknown inquiry type: ${data.inquiry}`);
      break;
    }

    return { success: true };
  } catch (error) {
    functions.logger.error("Error in inquiryFn:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing the inquiry."
    );
  }
});


export const createStaffInvitationFn = functions.https.onCall({
  region: "us-central1",
  secrets: ["SMARTREFILL_BREVO_API_KEY"],
  ...runtimeOptions,
}, async (request: functions.https.CallableRequest) => {
  try {
    const data: InviteProp = request.data;

    if (!data || !data.invitee.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a complete payload"
      );
    }

    // Calculate 3 days from now
    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + 3);

    await db.collection("invites").add({
      ...data,
      status: "pending",
      // Convert JS Date to Firestore Timestamp
      expiredAt: admin.firestore.Timestamp.fromDate(expirationDate),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    functions.logger.error("Error in createStaffInvitationFn:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing the invites."
    );
  }
});

// --------------------------------------------------------
// Business Operations (Migrated from client)
// --------------------------------------------------------

export const addDeliveryFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addDelivery
);
export const updateDeliveryFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateDelivery
);
export const deleteDeliveryFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteDelivery
);

export const addCustomerFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addCustomer
);
export const updateCustomerFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateCustomer
);
export const deleteCustomerFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteCustomer
);

export const addExpenseFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addExpense
);
export const updateExpenseFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateExpense
);
export const deleteExpenseFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteExpense
);

export const addNotificationFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addNotification
);
export const markNotificationsAsReadFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  markNotificationsAsRead
);

export const addStaffFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addStaff
);
export const updateStaffFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateStaff
);
export const markStaffAsPaidFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  markStaffAsPaid
);
export const addPayrollAdjustmentFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addPayrollAdjustment
);
export const updatePayrollAdjustmentFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updatePayrollAdjustment
);
export const deletePayrollAdjustmentFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deletePayrollAdjustment
);

export const addInventoryItemFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addInventoryItem
);
export const updateInventoryItemFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateInventoryItem
);
export const deleteInventoryItemFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteInventoryItem
);
export const assignItemsToCustomerFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  assignItemsToCustomer
);
export const updateInventoryAssignmentFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateInventoryAssignment
);
export const deleteInventoryAssignmentFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteInventoryAssignment
);

export const addTankFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addTank
);
export const updateTankFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateTank
);
export const deleteTankFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteTank
);
export const logTankActivityFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  logTankActivity
);

export const addCustomPackageFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addCustomPackage
);
export const updateCustomPackageFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateCustomPackage
);
export const deleteCustomPackageFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteCustomPackage
);

export const addItemCategoryFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addItemCategory
);
export const updateItemCategoryFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateItemCategory
);
export const deleteItemCategoryFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteItemCategory
);
export const addOrderItemFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  addOrderItem
);
export const updateOrderItemFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateOrderItem
);
export const deleteOrderItemFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  deleteOrderItem
);

export const updateBusinessProfileFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  updateBusinessProfile
);
export const submitPartnerApplicationFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  submitPartnerApplication
);
export const submitUserFeedbackFn = functions.https.onCall(
  { region: "us-central1", ...runtimeOptions },
  submitUserFeedback
);

// --------------------------------------------------------
// BFF Unified Gateway (SmartRefill v3)
// --------------------------------------------------------
export const smartrefillBffFn = smartrefillBff;
