import { Output, streamText } from "ai";
import { openai } from "./openai";
import z from "zod";
import { encode } from "@toon-format/toon";
import { wordEvalSchema } from "./schema";

export function evaluateTranscription({
  expected,
  transcription,
}: {
  expected: {
    text: string;
    parts: {
      text: string;
      id: number;
    }[];
  };
  transcription: string;
}) {
  const prompt = `Evaluate the recited Quran transcript against the expected Ayah.

Expected words: 
${encode(expected)}

Transcription: 
${transcription}

Rules:
- Mark missing as incorrect
  `;

  const evaluationSchema = z
    .object({
      words: z.array(wordEvalSchema).length(expected.parts.length),
    })
    .describe(`Return evaluation against all the words in sequence`);

  const result = streamText({
    model: openai("gpt-5.4-nano"),
    output: Output.object({
      schema: evaluationSchema,
    }),
    prompt,
  });

  return result;
}
