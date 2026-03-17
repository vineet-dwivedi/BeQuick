import nodemailer from "nodemailer";

const trimValue = (value) => (typeof value === "string" ? value.trim() : "");

const smtpHost = trimValue(process.env.SMTP_HOST);
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const smtpUser = trimValue(process.env.SMTP_USER);
const smtpPass = trimValue(process.env.SMTP_PASS);
const smtpFromRaw = trimValue(process.env.SMTP_FROM);

function normalizeFrom(value, fallback) {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const emailFromValue = value.match(emailRegex)?.[0];
  const emailFromFallback = fallback.match(emailRegex)?.[0];
  const email = emailFromValue || emailFromFallback;

  if (!email) return value || fallback || "";
  if (value.includes("<") && value.includes(">")) return value;
  if (value && value !== email) return `BeQuick <${email}>`;
  return email;
}

const smtpFrom = normalizeFrom(smtpFromRaw || smtpUser, smtpUser);

export function isSmtpConfigured() {
  return Boolean(smtpHost && smtpUser && smtpPass && smtpFrom);
}

let transporter = null;

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  return transporter;
}

export async function sendOtpEmail({ email, code }) {
  const mailer = getTransporter();
  if (!mailer || !smtpFrom) {
    throw new Error("SMTP is not configured");
  }

  const subject = "Your BeQuick verification code";
  const text = `Your BeQuick verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f6f7fb; padding:24px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:16px; border:1px solid #e6e9f0; overflow:hidden;">
        <div style="padding:20px 24px; background:#0b0f16; color:#ffffff;">
          <h2 style="margin:0; font-size:20px; letter-spacing:1px;">BeQuick</h2>
          <p style="margin:6px 0 0; color:#c7cbd6; font-size:13px;">Secure login verification</p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px; color:#111827;">Use the code below to finish signing in.</p>
          <div style="font-size:28px; font-weight:700; letter-spacing:6px; text-align:center; background:#f3f4f6; padding:14px 18px; border-radius:12px; margin:16px 0;">
            ${code}
          </div>
          <p style="margin:0; color:#6b7280; font-size:13px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="margin:16px 0 0; color:#6b7280; font-size:13px;">If you didn’t request this, you can safely ignore this email.</p>
        </div>
      </div>
    </div>
  `;

  await mailer.sendMail({
    from: smtpFrom,
    to: email,
    subject,
    text,
    html
  });
}
