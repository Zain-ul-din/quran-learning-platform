import { NextResponse } from "next/server";
import { hash } from "node:crypto";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const language = body.targetLanguage ?? "ar";
  const userIdHash = hash("sha1", Buffer.from("userid"));
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Safety-Identifier": `${userIdHash}`,
        },
        body: JSON.stringify({
          session: {
            type: "transcription",
            audio: {
              input: {
                transcription: {
                  model: "gpt-transcribe",
                  languages: [language],
                },
                turn_detection: {
                  type: "server_vad",
                  silence_duration_ms: 800,
                },
              },
            },
          },
        }),
      },
    );

    const json = await response.json();
    return NextResponse.json(json, { status: response.status });
  } catch (err) {
    console.log(err);
    return NextResponse.json({}, { status: 500 });
  }
}
