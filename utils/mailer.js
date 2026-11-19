import { Resend } from "resend";
import { createTransporter } from "../src/Router/EmailVerify/nodemailer.js";

/**
 * Universal mail sender:
 * 1. Uses Resend (HTTPS) if RESEND_API_KEY is present
 * 2. Uses Brevo (HTTPS) if BREVO_API_KEY is present
 * 3. Falls back to Nodemailer (SMTP)
 */
export async function sendOtpEmail({ to, subject, html }) {
  const fromName = process.env.EMAIL_FROM_NAME || "DM Advance Tech";
  const fromEmail = process.env.EMAIL_USER || "techdmadvance@gmail.com";

  // 1. Resend API (HTTPS Port 443 - works on Render)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || `${fromName} <onboarding@resend.dev>`;
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend Error: ${error.message}`);
    }
    return data;
  }

  // 2. Brevo API (HTTPS Port 443 - works on Render, free 300 emails/day)
  if (process.env.BREVO_API_KEY) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Brevo Error: ${data.message || JSON.stringify(data)}`);
    }
    return data;
  }

  // 3. Nodemailer SMTP (Default fallback)
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    to,
    from: `"${fromName}" <${fromEmail}>`,
    subject,
    html,
  });
  return info;
}
