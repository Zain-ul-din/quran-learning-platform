const TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";

export async function transcribeAudio({
  model,
  language,
  response_format,
  file,
}: {
  model: "gpt-transcribe";
  response_format: "json";
  language: "ar";
  file: File;
}) {
  // NOTE:
  // The transcriptions endpoint takes multipart/form-data; JSON.stringify
  // would drop the File (it serializes to {}) and OpenAI answers 400.
  const form = new FormData();
  form.append("file", file);
  form.append("model", model);
  form.append("language", language);
  form.append("response_format", response_format);

  const response = await fetch(TRANSCRIPTION_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });

  const data = (await response.json()) as { text?: string };

  if (!response.ok) {
    console.error("Transcription failed:", data);
    return null;
  }

  return data;
}
