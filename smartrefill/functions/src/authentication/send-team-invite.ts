import { logger } from "firebase-functions";
import { brevo, getBrevoApi } from "../utils/brevo-client";
import { TeamInviteProp } from "../interface/";


export async function sendTeamInvite(data: TeamInviteProp) {
  try {
    const {
      inviteLink,
      inviter,
      invitee,
      inviterEmail,
      inviteeEmail,
      organization,
    } = data;

    const api = getBrevoApi();

    const baseUrl = process.env.APP_BASE_URL || "https://smartrefill.io";
    const url = `${baseUrl}/${inviteLink}`;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Team Invite: You've been invited to join Smart Refill";
    sendSmtpEmail.to = [{ email: inviteeEmail, name: invitee }];
    sendSmtpEmail.cc = [{ email: inviterEmail, name: inviter }];
    sendSmtpEmail.templateId = 28;
    sendSmtpEmail.params = {
      url,
      inviter,
      invitee,
      inviteeEmail,
      organization,
    };

    await api.sendTransacEmail(sendSmtpEmail);

    logger.info(
      `Team Invite sent to ${inviteeEmail} 
      (invited by ${inviterEmail}) for organization ${organization}`
    );
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
