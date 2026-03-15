import { z } from "zod";

export const companiesQuerySchema = z.object({
  type: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  stack: z.string().optional(),
  includeJobs: z.string().optional()
});

export const companyParamsSchema = z.object({
  id: z.string().min(1)
});
