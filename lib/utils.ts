export { cn } from "cn";
import { IncompleteJsonParser } from "incomplete-json-parser";

export function normalizeQuranEnTranslation(text: string) {
  return text
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function safeJsonParse(str: string) {
  try {
    const parser = new IncompleteJsonParser();
    parser.write(str);
    return parser.getObjects();
  } catch {
    return null;
  }
}

export function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
