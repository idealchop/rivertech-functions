export function getSmartRefillVerificationTemplate(username: string, verificationLink: string) {
  const brandColor = "#44c1ba";
  const timestamp = Date.now();

  return {
    subject: "Verify Your Email for Smart Refill",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
              .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
              .header { background-color: ${brandColor}; color: #ffffff; padding: 40px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 800; }
              .content { padding: 40px; background-color: #ffffff; text-align: center; }
              .button-container { text-align: center; margin: 30px 0; }
              .button { background-color: ${brandColor}; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 10px 15px -3px rgba(83, 142, 194, 0.3); }
              .footer { background-color: #f1f1f1; padding: 30px; font-size: 11px; color: #777; line-height: 1.4; text-align: center; }
              .footer-brand { font-size: 16px; font-weight: 700; color: ${brandColor}; margin-bottom: 4px; }
              .footer-sub { font-size: 14px; color: #94a3b8; margin: 0; line-height: 1.6; }
              .footer-sub a { color: ${brandColor}; text-decoration: none; font-weight: 700; }
              .small-text { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Smart Refill</h1>
                  <p style="margin-top: 5px; font-size: 14px; opacity: 0.9;">The WRS Partner for Growth</p>
              </div>

              <div class="content">
                  <h2 style="font-weight: 800; font-size: 22px; color: #0f172a; margin-bottom: 16px;">Verify Your Email Address</h2>
                  <p>Hello <strong>${username}</strong>,</p>
                  <p>Thanks for signing up for Smart Refill! Please click the button below to verify your email address and activate your account.</p>

                  <div class="button-container">
                      <a href="${verificationLink}" class="button">Verify Email Address</a>
                  </div>

                  <p class="small-text">If you did not create an account, no further action is required.</p>
              </div>

              <div class="footer">
                  <div class="footer-brand">River PH - Automated, Connected, Convenient.</div>
                  <div class="footer-sub">
                    See how we’re shaping the future of the Philippines<br>
                    <a href="https://riverph.com">riverph.com</a>
                  </div>
                  
                  <div style="margin: 15px 0; border-top: 1px solid #ddd; padding-top: 10px; text-align: justify; font-size: 10px;">
                      <strong>DISCLAIMER:</strong> This communication and any attachments are intended to be confidential, protected under the Data Privacy Act of 2012 (RA 10173), Intellectual Property laws, and other applicable Philippine statutes. It is intended for the exclusive use of the addressee. If you are not the intended recipient, you are hereby notified that any disclosure, retention, dissemination, copying, alteration, or distribution of this communication and/or any attachment, or any part thereof or information therein, is strictly prohibited. If you have received this communication in error, kindly notify the sender by e-mail, and delete this communication and all attachments immediately.
                  </div>
                  <p style="text-align: center;">© 2026 Smart Refill. All rights reserved.</p>
              </div>
          </div>
          <div style="display:none; white-space:nowrap; font:15px courier; line-height:0; color: #ffffff;"> - Verification ID: ${timestamp} - </div>
      </body>
      </html>
    `,
  };
}
