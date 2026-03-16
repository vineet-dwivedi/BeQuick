import { z } from "zod";

export const registerSchema = z.object({
  user: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const requestOtpSchema = z.object({
  email: z.string().email()
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8)
});
