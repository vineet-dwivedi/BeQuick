import { z } from "zod";

export const sourceQuerySchema = z.object({
  active: z.string().optional(),
  type: z.string().optional(),
  region: z.string().optional(),
  tag: z.string().optional(),
  limit: z.string().optional()
});

export const sourceParamsSchema = z.object({
  id: z.string().min(1)
});

export const sourceCreateSchema = z.object({
  name: z.string().min(1),
  website: z.string().optional(),
  careerPage: z.string().optional(),
  sourceType: z.string().optional(),
  region: z.string().optional(),
  tags: z.array(z.string()).optional(),
  active: z.boolean().optional()
});

export const sourceUpdateSchema = z.object({
  name: z.string().optional(),
  website: z.string().optional(),
  careerPage: z.string().optional(),
  sourceType: z.string().optional(),
  region: z.string().optional(),
  tags: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  lastCrawledAt: z.coerce.date().optional()
});
