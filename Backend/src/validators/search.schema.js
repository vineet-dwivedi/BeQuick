import { z } from "zod";

export const searchSchema = z.object({
  prompt: z.string().min(3),
  includeRemote: z.boolean().optional(),
  company: z.string().optional(),
  limit: z.number().int().positive().max(200).optional(),
  page: z.number().int().positive().optional()
});

export const searchQuerySchema = z.object({
  prompt: z.string().min(3).optional(),
  includeRemote: z.string().optional(),
  company: z.string().optional(),
  limit: z.string().optional(),
  page: z.string().optional()
});
