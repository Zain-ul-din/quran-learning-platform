import z from "zod";

export const wordEvalSchema = z.object({
  wordId: z.number(),
  status: z.enum(["correct", "incorrect"]),
  heard: z.string().nullable(),
});

export type WordEvalSchema = z.infer<typeof wordEvalSchema>;
