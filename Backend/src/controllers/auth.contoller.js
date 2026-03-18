import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import userModel from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const googleClientIds = String(
  process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_IDS || ""
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const oauthClient = new OAuth2Client();

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
    createdAt: user.createdAt
  };
}

function buildFallbackName(email, name) {
  const trimmedName = String(name || "").trim();
  if (trimmedName) return trimmedName;

  const localPart = String(email || "").split("@")[0] || "user";
  return localPart;
}

function buildPlaceholderPassword() {
  return crypto.randomBytes(48).toString("hex");
}

async function verifyGoogleCredential(credential) {
  if (!googleClientIds.length) {
    throw new Error("Google auth is not configured. Set GOOGLE_CLIENT_ID on the backend.");
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken: credential,
    audience: googleClientIds
  });

  return ticket.getPayload();
}

export async function googleLogin(req, res) {
  const credential = String(req.body?.credential || "").trim();

  if (!credential) {
    return res.status(400).json({ error: "Google credential is required." });
  }

  let payload;

  try {
    payload = await verifyGoogleCredential(credential);
  } catch (error) {
    return res.status(401).json({ error: error?.message || "Google login failed." });
  }

  const googleSub = String(payload?.sub || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  const emailVerified = Boolean(payload?.email_verified);

  if (!googleSub || !email || !emailVerified) {
    return res.status(401).json({ error: "Google account email is not verified." });
  }

  const name = buildFallbackName(email, payload?.name);
  let user = await userModel.findOne({
    $or: [{ googleSub }, { email }]
  });

  if (user && user.googleSub && user.googleSub !== googleSub) {
    return res.status(409).json({
      error: "This email is already linked to a different Google account."
    });
  }

  if (!user) {
    user = await userModel.create({
      user: name,
      email,
      googleSub,
      passwordHash: buildPlaceholderPassword()
    });
  } else {
    user.user = name || user.user;
    user.email = email;
    user.googleSub = googleSub;
    await user.save();
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
