import { z } from "zod";

export const jobsQuerySchema = z.object({
  stack: z.string().optional(),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  companyId: z.string().optional(),
  remoteType: z.string().optional(),
  limit: z.string().optional()
});

export const jobParamsSchema = z.object({
  id: z.string().min(1)
});
