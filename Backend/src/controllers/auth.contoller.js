import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { isSmtpConfigured, sendOtpEmail } from "../services/email.service.js";
import {
  clearOtp,
  getOtp,
  hasOtpCooldown,
  getOtpCooldownTtl,
  saveOtp,
  setOtpCooldown,
  updateOtp
} from "../services/otp.service.js";

// Simple auth controller: register, login, logout, and me.
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 600);
const OTP_COOLDOWN_SECONDS = Number(process.env.OTP_COOLDOWN_SECONDS || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

function getOtpEmailErrorMessage(error) {
  const message = String(error?.message || "");

  if (/invalid login|auth|eauth/i.test(message)) {
    return "SMTP authentication failed. Check SMTP_USER and SMTP_PASS.";
  }

  if (/timed out|timeout|greeting/i.test(message)) {
    return "SMTP connection timed out. Check SMTP host, port, and whether your deploy host allows outbound mail.";
  }

  return "Failed to send OTP email. Check SMTP settings.";
}

function signToken(user) {
  // Create a JWT token for the user.
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Remove password hash before sending user data to the client.
function toPublicUser(user) {
  return {
    id: user._id,
    user: user.user,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

// Create a new account and return a token.
export async function register(req, res) {
  const { user, email, password } = req.body || {};

  if (!user || !email || !password) {
    return res.status(400).json({ error: "user, email, and password are required" });
  }

  const existing = await userModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // Hash the password before saving.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const created = await userModel.create({ user, email, passwordHash });

  // Send token + safe user data.
  const token = signToken(created);
  return res.status(201).json({ user: toPublicUser(created), token });
}

export async function requestOtp(req, res) {
  const { email } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase();

  try {
    if (await hasOtpCooldown(normalizedEmail)) {
      const retryAfter = await getOtpCooldownTtl(normalizedEmail);
      return res.json({
        message: "OTP already sent. Please wait before requesting another code.",
        cooldown: true,
        retryAfter
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const payload = {
      code,
      attempts: 0,
      expiresAt: Date.now() + OTP_TTL_SECONDS * 1000
    };

    await saveOtp(normalizedEmail, payload, OTP_TTL_SECONDS);
    await setOtpCooldown(normalizedEmail, OTP_COOLDOWN_SECONDS);

    if (!isSmtpConfigured()) {
      await clearOtp(normalizedEmail);
      return res.status(500).json({
        error: "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM."
      });
    }

    try {
      await sendOtpEmail({ email: normalizedEmail, code });
    } catch (error) {
      console.error("OTP email failed:", error?.message || error);
      await clearOtp(normalizedEmail);
      return res.status(500).json({ error: getOtpEmailErrorMessage(error) });
    }

    return res.json({ message: "OTP sent" });
  } catch (error) {
    return res.status(500).json({ error: "OTP service unavailable." });
  }
}

export async function verifyOtp(req, res) {
  const { email, code } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase();
  const submittedCode = String(code || "").trim();

  try {
    const payload = await getOtp(normalizedEmail);
    if (!payload) {
      return res.status(400).json({ error: "OTP expired or not found." });
    }

    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      await clearOtp(normalizedEmail);
      return res.status(400).json({ error: "OTP expired or not found." });
    }

    if (payload.code !== submittedCode) {
      const attempts = (payload.attempts || 0) + 1;
      if (attempts >= OTP_MAX_ATTEMPTS) {
        await clearOtp(normalizedEmail);
        return res.status(400).json({ error: "Invalid code. Please request a new OTP." });
      }

      const remainingSeconds = Math.max(
        1,
        Math.ceil((payload.expiresAt - Date.now()) / 1000)
      );
      await updateOtp(normalizedEmail, { ...payload, attempts }, remainingSeconds);
      return res.status(400).json({ error: "Invalid code." });
    }

    await clearOtp(normalizedEmail);

    let user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      const fallbackUser = normalizedEmail.split("@")[0] || "user";
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);
      user = await userModel.create({
        user: fallbackUser,
        email: normalizedEmail,
        passwordHash
      });
    }

    const token = signToken(user);
    return res.json({ user: toPublicUser(user), token });
  } catch (error) {
    return res.status(500).json({ error: "OTP service unavailable." });
  }
}

// Login and return a token.
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await userModel.findOne({ email });
  // Compare password with stored hash.
  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordOk) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Login success: return token + user.
  const token = signToken(user);
  return res.json({ user: toPublicUser(user), token });
}

// Return the current user based on the JWT.
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

// Stateless logout (client can delete the token).
export function logout(req, res) {
  return res.json({ message: "Logged out" });
}
