import { z } from "zod";

export const createJournalSchema = z.object({
  mood: z.string().optional(),
  content: z.string().min(1, "Journal content is required"),
  tradeId: z.string().optional(),
});

export const updateJournalSchema = createJournalSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;
