import { NextRequest, NextResponse } from "next/server";
import { streamText, createTextStreamResponse, toTextStream, Output } from "ai";
import { openai } from "@/lib/openai";
import { Chapter, Verse } from "@quranjs/api";
import { z } from "zod";

import { encode } from "@toon-format/toon";

import { pick } from "lodash";
import { recitedVerseOutputSchema } from "@/lib/schema";

const TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";

// TODO: Manage Edge cases

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;

  const context = JSON.parse(formData.get("context")!.toString()) as {
    chapter: Chapter;
    verse: Verse;
  };

  if (!audioFile) {
    console.log("No audio file provided");
    return NextResponse.json({}, { status: 400 });
  }

  try {
    const openaiForm = new FormData();
    openaiForm.append("file", audioFile);
    openaiForm.append("model", "gpt-transcribe");
    openaiForm.append("response_format", "json");
    openaiForm.append("language", "ar");

    const response = await fetch(TRANSCRIPTION_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: openaiForm,
    });

    const data = (await response.json()) as { text?: string };

    if (!response.ok) {
      console.error("Transcription failed:", data);
      return NextResponse.json({}, { status: 500 });
    }

    const verseContext = encode(
      pick(
        context.verse,
        ...Object.keys(context.verse).filter((key) =>
          key.toLowerCase().startsWith("text"),
        ),
      ),
    );

    const prompt = `Check the correctness of following recitation transcript word by word:\n\n${data.text}\n\nCONTEXT:\n\nChapter:\n${encode(context.chapter)}\n\nVerse:${verseContext}`;

    const schema = z
      .object(
        Object.fromEntries(
          (context.verse.words || [])
            .filter((w) => w.charTypeName !== "end")
            .map((word) => {
              return [`${word.id}_${word.text}`, recitedVerseOutputSchema];
            }),
        ),
      )
      .describe("All the words in Ayah in <position>_<word> format");

    const result = streamText({
      model: openai("gpt-5.4-nano"),
      output: Output.object({
        schema,
      }),
      prompt,
    });

    return createTextStreamResponse({
      stream: toTextStream({ stream: result.stream }),
    });
  } catch (err) {
    console.error("process-audio failed:", err);
  }

  return NextResponse.json({}, { status: 500 });
}
