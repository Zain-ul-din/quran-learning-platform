import z from "zod";

export const recitedVerseOutputSchema = z.object({
  status: z.enum(["correct", "incorrect"]),
  confidence: z.number().min(0).max(1),
});

export type RecitedVerseOutputSchema = z.infer<typeof recitedVerseOutputSchema>;
