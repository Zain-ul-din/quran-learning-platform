import { NextRequest, NextResponse } from "next/server";
import { createTextStreamResponse, toTextStream } from "ai";
import { Chapter, Verse } from "@quranjs/api";

import { transcribeAudio } from "@/lib/transcribe-audio";
import { evaluateTranscription } from "@/lib/evaluate-transcription";

// TODO: Manage Edge cases

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;

  const context = JSON.parse(formData.get("context")!.toString()) as {
    chapter: Chapter;
    verse: Verse;
  };

  if (!audioFile) return NextResponse.json({}, { status: 400 });

  try {
    const transcribeRes = await transcribeAudio({
      file: audioFile,
      model: "gpt-transcribe",
      language: "ar",
      response_format: "json",
    });

    if (!transcribeRes) return NextResponse.json({}, { status: 500 });

    const text = (context.verse.textUthmani ||
      context.verse.textIndopak) as string;

    const result = evaluateTranscription({
      expected: {
        text,
        parts: (context.verse.words || [])
          .filter((w) => w.charTypeName !== "end")
          .map((word) => ({
            id: word.id!,
            text: word.text!,
          })),
      },
      transcription: transcribeRes.text!,
    });

    return createTextStreamResponse({
      stream: toTextStream({ stream: result.stream }),
    });
  } catch (err) {
    console.error("process-audio failed:", err);
  }

  return NextResponse.json({}, { status: 500 });
}
