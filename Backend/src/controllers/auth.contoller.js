import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

// Simple auth controller: register, login, logout, and me.
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

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
