import { WordEvalSchema } from "@/lib/schema";
import { Chapter, Verse } from "@quranjs/api";
import { EventObject, fromCallback } from "xstate";
import { RecitedWord } from "../types";
import { safeJsonParse } from "@/lib/utils";

type RecitedScore = { words: WordEvalSchema[] };

export const evaluateAudio = fromCallback<
  EventObject,
  {
    blob: Blob;
    chapter: Chapter;
    selectedVerse: Verse;
  },
  { type: "evaluation.error"; error?: string }
>(({ input, sendBack }) => {
  const abortController = new AbortController();

  const applyRecited = (payload: RecitedScore | null, selectedVerse: Verse) => {
    if (!payload || !Array.isArray(payload.words)) return;
    if (!selectedVerse?.words?.length) return;

    const recitedWords = payload.words
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const word = selectedVerse.words!.find((w) => w.id === entry.wordId);
        if (!word) return null;
        return { ...word, ...entry } as RecitedWord;
      })
      .filter((word): word is RecitedWord => word !== null);

    if (recitedWords.length > 0) {
      sendBack({
        type: "evaluation.stream",
        verseId: selectedVerse.id,
        recitedWords,
      });
    }
  };

  async function streamResponse() {
    const formData = new FormData();
    const extension = input.blob.type.includes("mp4") ? "m4a" : "webm";
    formData.append(
      "audio",
      new File([input.blob], `recording.${extension}`, {
        type: input.blob.type,
      }),
    );
    formData.append(
      "context",
      JSON.stringify({ chapter: input.chapter, verse: input.selectedVerse }),
    );

    const response = await fetch("/api/process-audio", {
      method: "POST",
      body: formData,
      signal: abortController.signal,
    });

    if (!response.ok || !response.body)
      throw new Error(`process-audio responded with ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (value) text += decoder.decode(value, { stream: true });
      applyRecited(safeJsonParse(text) as RecitedScore, input.selectedVerse);
      if (done) break;
    }

    text += decoder.decode();
    const score: RecitedScore | null = safeJsonParse(text);

    if (!score || !Array.isArray(score.words))
      throw new Error("process-audio sent a malformed score");

    applyRecited(score, input.selectedVerse);

    const allCorrect =
      score.words.length > 0 &&
      score.words.every((word) => word.status === "correct");

    sendBack({
      type: allCorrect ? "evaluation.success" : "evaluation.unsuccess",
    });
  }

  streamResponse().catch((err) => {
    const errorMsg =
      err instanceof Error ? err.message : "Something went wrong — try again";
    sendBack({
      type: "evaluation.error",
      error: errorMsg,
    });
  });

  return () => {
    abortController.abort();
  };
});
