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

  const subject = "Your BeQuick login code";
  const text = `Your BeQuick login code is ${code}. This code expires in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>BeQuick Login</h2>
      <p>Your login code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
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
