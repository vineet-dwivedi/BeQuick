import { z } from "zod";

export const searchSchema = z.object({
  prompt: z.string().min(3)
});

export const searchQuerySchema = z.object({
  prompt: z.string().min(3).optional()
});
