import { z } from "zod";

export const searchSchema = z.object({
  prompt: z.string().min(3)
});
