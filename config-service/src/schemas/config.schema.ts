import { z } from "zod";

export const createConfigSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.record(z.unknown())]),
});

export const updateConfigSchema = z.object({
  value: z.union([z.string(), z.record(z.unknown())]),
});

export type CreateConfigDto = z.infer<typeof createConfigSchema>;
export type UpdateConfigDto = z.infer<typeof updateConfigSchema>;
