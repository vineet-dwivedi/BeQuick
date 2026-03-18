const trimValue = (value) => (typeof value === "string" ? value.trim() : "");

const brevoApiBaseUrl = trimValue(process.env.BREVO_API_BASE_URL) || "https://api.brevo.com/v3";
const brevoApiKey = trimValue(process.env.BREVO_API_KEY);
const brevoSenderEmail = trimValue(process.env.BREVO_SENDER_EMAIL);
const brevoSenderName = trimValue(process.env.BREVO_SENDER_NAME || "BeQuick");

function getErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload.message === "string") return payload.message;
  if (Array.isArray(payload.errors) && typeof payload.errors[0]?.message === "string") {
    return payload.errors[0].message;
  }
  return fallback;
}

export function isEmailConfigured() {
  return Boolean(brevoApiKey && brevoSenderEmail);
}

async function sendTransactionalEmail({ toEmail, toName, subject, htmlContent, textContent }) {
  if (!isEmailConfigured()) {
    throw new Error("Brevo is not configured");
  }

  const response = await fetch(`${brevoApiBaseUrl}/smtp/email`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": brevoApiKey
    },
    body: JSON.stringify({
      sender: {
        email: brevoSenderEmail,
        name: brevoSenderName
      },
      to: [
        {
          email: toEmail,
          name: toName || undefined
        }
      ],
      subject,
      htmlContent,
      textContent
    })
  });

  const rawBody = await response.text();
  let parsedBody = null;

  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsedBody = rawBody;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(parsedBody, `Brevo request failed with status ${response.status}`));
  }

  return parsedBody;
}

export async function sendVerificationEmail({ email, name, verificationUrl }) {
  const safeName = trimValue(name) || "there";
  const subject = "Verify your BeQuick account";
  const textContent = [
    `Hi ${safeName},`,
    "",
    "Thanks for signing up for BeQuick.",
    "Click the link below to verify your email and activate your account:",
    verificationUrl,
    "",
    "If you did not create this account, you can ignore this email."
  ].join("\n");

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f6f7fb; padding:24px;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:18px; border:1px solid #e6e9f0; overflow:hidden;">
        <div style="padding:24px; background:#0b0f16; color:#ffffff;">
          <h2 style="margin:0; font-size:20px; letter-spacing:1px;">BeQuick</h2>
          <p style="margin:6px 0 0; color:#c7cbd6; font-size:13px;">Email verification</p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px; color:#111827;">Hi ${safeName},</p>
          <p style="margin:0 0 16px; color:#4b5563; line-height:1.6;">
            Thanks for creating your BeQuick account. Verify your email to unlock job search and dashboards.
          </p>
          <a
            href="${verificationUrl}"
            style="display:inline-block; padding:12px 18px; border-radius:999px; background:#111827; color:#ffffff; text-decoration:none; font-weight:600;"
          >
            Verify Email
          </a>
          <p style="margin:18px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">
            If the button does not work, copy and paste this link into your browser:
          </p>
          <p style="margin:8px 0 0; word-break:break-word; font-size:13px;">
            <a href="${verificationUrl}" style="color:#2563eb;">${verificationUrl}</a>
          </p>
          <p style="margin:18px 0 0; color:#6b7280; font-size:13px;">
            If you did not create this account, you can ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendTransactionalEmail({
    toEmail: email,
    toName: safeName,
    subject,
    htmlContent,
    textContent
  });
}
