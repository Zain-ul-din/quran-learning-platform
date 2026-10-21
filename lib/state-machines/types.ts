import { Chapter, ChapterRecitation, Verse, Word } from "@quranjs/api";
import { WordEvalSchema } from "../schema";

export type RecitationSegment = [number, number, number];

export type RecitationTimestamp = {
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
  duration?: number;
  segments?: RecitationSegment[];
};

export type ChapterRecitationWithTiming = ChapterRecitation & {
  timestamps?: RecitationTimestamp[];
};

export type RecitedWord = Word & WordEvalSchema;

export type ChapterStateMachineContext = {
  chapter: Chapter;
  recitation?: ChapterRecitationWithTiming | null;
  verses: Verse[];
  selectedVerse: Verse;
  recitationContext: {
    stream?: MediaStream;
    elapsedMs?: number;
    audio?: Blob;
    error?: string;
  };
  recitedVerses: {
    [id: string]: RecitedWord[];
  };
  listeningContext: {
    currentTime?: number;
  };
};

export type Event<T extends string, U extends object = object> = {
  type: T;
} & U;

export type Events =
  | Event<"RECORD">
  | Event<"LISTEN">
  | Event<"RESET">
  | Event<
      "verse.update",
      {
        verse: Verse;
      }
    >
  | Event<"STOP">
  | Event<
      "audio.elapsedMs",
      {
        elapsedMs: number;
      }
    >
  | Event<
      "audio.stream",
      {
        stream: MediaStream;
      }
    >
  | Event<
      "audio.recoded",
      {
        blob: Blob;
      }
    >
  | Event<
      "audio.error",
      {
        error: string;
      }
    >
  | Event<
      "evaluation.error",
      {
        error: string;
      }
    >
  | Event<
      "evaluation.stream",
      {
        verseId: number;
        recitedWords: RecitedWord[];
      }
    >
  | Event<"evaluation.success">
  | Event<"evaluation.unsuccess">
  | Event<"play.stop">
  | Event<"play.finish">
  | Event<
      "play.updateCurrentTime",
      {
        currentTime: number;
      }
    >
  | Event<"PAUSE">;
