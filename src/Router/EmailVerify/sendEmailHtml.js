export function buildEmailHtml({ name = "User", code, minutes = 10 }) {
  const expiryText = `${minutes} minute${minutes > 1 ? "s" : ""}`;
  const companyName = "DM Advance Tech";
  const primaryColor = "#2563eb"; // Professional Blue

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification - ${companyName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        
        <div style="background-color: ${primaryColor}; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
            ${companyName}
          </h1>
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-top: 0;">Hello ${name},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            We received a request to access your <strong>${companyName}</strong> account. Please use the following verification code to proceed. This code is valid for <strong>${expiryText}</strong>.
          </p>

          <div style="margin: 35px 0; padding: 25px; background-color: #f8fafc; border: 1px dashed ${primaryColor}; border-radius: 12px; text-align: center;">
            <span style="display: block; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 10px; letter-spacing: 1px;">Your Verification Code</span>
            <div style="font-size: 36px; letter-spacing: 8px; font-weight: 800; color: ${primaryColor}; font-family: monospace;">${code}</div>
          </div>

          <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
            If you didn't make this request, you can safely ignore this email. Your account security is our top priority.
          </p>
          
          <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">Team ${companyName}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">Empowering Next-Gen Learning</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
          </p>
          <div style="margin-top: 10px;">
              <a href="#" style="color: ${primaryColor}; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
              <a href="#" style="color: ${primaryColor}; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}