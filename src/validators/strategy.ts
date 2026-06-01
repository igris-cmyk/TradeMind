import { z } from "zod";

export const createStrategySchema = z.object({
  name: z.string().min(1, "Strategy name is required").max(100),
  description: z.string().max(500).optional(),
  conceptType: z.string().optional(),
});

export const updateStrategySchema = createStrategySchema.partial().extend({
  id: z.string().min(1),
});

export type CreateStrategyInput = z.infer<typeof createStrategySchema>;
export type UpdateStrategyInput = z.infer<typeof updateStrategySchema>;
