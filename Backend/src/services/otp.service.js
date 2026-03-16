import { createRedisConnection } from "../queue/connection.js";

const redis = createRedisConnection();

const OTP_PREFIX = "otp";
const COOLDOWN_PREFIX = "otp:cooldown";

const otpKey = (email) => `${OTP_PREFIX}:${email.toLowerCase()}`;
const cooldownKey = (email) => `${COOLDOWN_PREFIX}:${email.toLowerCase()}`;

export async function saveOtp(email, payload, ttlSeconds) {
  await redis.set(otpKey(email), JSON.stringify(payload), "EX", ttlSeconds);
}

export async function getOtp(email) {
  const raw = await redis.get(otpKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function updateOtp(email, payload, ttlSeconds) {
  await redis.set(otpKey(email), JSON.stringify(payload), "EX", ttlSeconds);
}

export async function clearOtp(email) {
  await redis.del(otpKey(email));
}

export async function setOtpCooldown(email, ttlSeconds) {
  await redis.set(cooldownKey(email), "1", "EX", ttlSeconds);
}

export async function hasOtpCooldown(email) {
  const value = await redis.get(cooldownKey(email));
  return Boolean(value);
}

export async function getOtpCooldownTtl(email) {
  const ttl = await redis.ttl(cooldownKey(email));
  return ttl > 0 ? ttl : 0;
}
