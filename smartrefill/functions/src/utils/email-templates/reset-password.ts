export function getResetPasswordTemplate(resetLink: string) {
  return {
    subject: "Reset Your Smart Refill Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px 40px;">
                      <img src="https://firebasestorage.googleapis.com/v0/b/smartrefill-singapore/o/Brand%20Logo%2FAsset%2022.png?alt=media&token=f7458efe-afd7-4006-862e-40c8d524c080" alt="Smart Refill Logo" width="60" style="margin-bottom: 20px;">
                      <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 700; text-align: center;">Reset Your Password</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px; color: #475569; font-size: 16px; line-height: 1.6;">
                      <p style="margin: 0 0 20px 0;">Hello,</p>
                      <p style="margin: 0 0 20px 0;">You recently requested to reset the password for your Smart Refill account. Click the button below to choose a new password:</p>
                  
                      <div style="text-align: center; padding: 20px 0;">
                        <a href="${resetLink}" style="display: inline-block; background-color: #46B1AE; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
                          Reset Password
                        </a>
                      </div>
                  
                      <p style="margin: 20px 0 0 0;">If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
                      <p style="margin: 10px 0 0 0; font-size: 14px; color: #94a3b8;">This link will expire in 60 minutes for security reasons.</p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f1f5f9; text-align: center;">
                      <p style="margin: 0; color: #64748b; font-size: 12px;">
                        Smart Refill &bull; River Tech Inc.<br>
                        26th Floor, 304 Filinvest Ave, Alabang, Muntinlupa<br>
                        Manila, Philippines
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };
}