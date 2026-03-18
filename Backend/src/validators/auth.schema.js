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

export const resendVerificationSchema = z.object({
  email: z.string().email()
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20)
});
