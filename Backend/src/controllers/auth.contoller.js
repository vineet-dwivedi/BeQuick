import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { isEmailConfigured, sendVerificationEmail } from "../services/email.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const EMAIL_VERIFICATION_TTL_HOURS = Number(process.env.EMAIL_VERIFICATION_TTL_HOURS || 24);

const trimValue = (value) => (typeof value === "string" ? value.trim() : "");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function hashVerificationToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashVerificationToken(token),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000)
  };
}

function getPublicAppUrl() {
  const explicitAppUrl = trimValue(process.env.APP_URL);
  if (explicitAppUrl) {
    return explicitAppUrl.replace(/\/$/, "");
  }

  const allowedOrigins = String(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const preferredOrigin =
    allowedOrigins.find((value) => !/localhost|127\.0\.0\.1/i.test(value)) ||
    allowedOrigins[0] ||
    "http://localhost:5173";

  return preferredOrigin.replace(/\/$/, "");
}

function buildVerificationUrl(token) {
  return `${getPublicAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;
}

function getAuthEmailErrorMessage(error) {
  const message = String(error?.message || "");

  if (/api key|unauthorized|permission/i.test(message)) {
    return "Email delivery is not configured correctly. Check your Brevo API key.";
  }

  if (/fetch failed|network|timed out|timeout/i.test(message)) {
    return "Email delivery could not reach Brevo. Check your deploy host network access.";
  }

  return "Failed to send verification email. Check your Brevo configuration.";
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function toPublicUser(user) {
  return {
    id: user._id,
    user: user.user,
    email: user.email,
    role: user.role,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt
  };
}

async function issueVerificationLink(user) {
  const { token, tokenHash, expiresAt } = createVerificationToken();
  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpiresAt = expiresAt;
  await user.save();

  await sendVerificationEmail({
    email: user.email,
    name: user.user,
    verificationUrl: buildVerificationUrl(token)
  });
}

export async function register(req, res) {
  const name = trimValue(req.body?.user);
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ error: "user, email, and password are required" });
  }

  if (!isEmailConfigured()) {
    return res.status(500).json({
      error: "Brevo is not configured. Set BREVO_API_KEY and sender settings first."
    });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const existing = await userModel.findOne({ email });

  if (existing?.emailVerified) {
    return res.status(409).json({ error: "Email already registered. Please log in." });
  }

  const account =
    existing ||
    new userModel({
      user: name,
      email,
      passwordHash
    });

  account.user = name;
  account.passwordHash = passwordHash;
  account.emailVerified = false;

  try {
    await issueVerificationLink(account);
    return res.status(existing ? 200 : 201).json({
      message: "Account created. Check your email for the verification link before logging in."
    });
  } catch (error) {
    console.error("Verification email failed:", error?.message || error);
    return res.status(500).json({ error: getAuthEmailErrorMessage(error) });
  }
}

export async function resendVerificationEmail(req, res) {
  const email = normalizeEmail(req.body?.email);
  const account = await userModel.findOne({ email });

  if (!account) {
    return res.json({
      message: "If an account exists for that email, a fresh verification link has been sent."
    });
  }

  if (account.emailVerified) {
    return res.json({ message: "This email is already verified. Please log in." });
  }

  if (!isEmailConfigured()) {
    return res.status(500).json({
      error: "Brevo is not configured. Set BREVO_API_KEY and sender settings first."
    });
  }

  try {
    await issueVerificationLink(account);
    return res.json({
      message: "Verification link sent. Check your inbox and open the link to activate your account."
    });
  } catch (error) {
    console.error("Resend verification email failed:", error?.message || error);
    return res.status(500).json({ error: getAuthEmailErrorMessage(error) });
  }
}

export async function verifyEmail(req, res) {
  const token = trimValue(req.body?.token);
  const tokenHash = hashVerificationToken(token);

  const account = await userModel.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() }
  });

  if (!account) {
    return res.status(400).json({ error: "Verification link is invalid or expired." });
  }

  account.emailVerified = true;
  account.emailVerificationTokenHash = null;
  account.emailVerificationExpiresAt = null;
  await account.save();

  return res.json({ message: "Email verified. You can log in now." });
}

export async function login(req, res) {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await userModel.findOne({ email });
  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!user.emailVerified) {
    return res.status(403).json({
      error: "Please verify your email before logging in.",
      requiresVerification: true
    });
  }

  const token = signToken(user);
  return res.json({ user: toPublicUser(user), token });
}

export async function me(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user: toPublicUser(user) });
}

export function logout(req, res) {
  return res.json({ message: "Logged out" });
}
