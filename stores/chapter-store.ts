"use client";
import { create } from "zustand";
import type { Chapter, Verse, Word } from "@quranjs/api";
import { WordEvalSchema } from "@/lib/schema";

export type RecitedWord = Word & WordEvalSchema;

interface ChapterState {
  chapter: Chapter | null;
  verses: Verse[];
  selectedVerse: Verse | null;
  processing: boolean;
  setChapter: (chapter: Chapter) => void;
  setVerses: (verses: Verse[]) => void;
  setSelectedVerse: (verse: Verse | null) => void;
  setProcessing: (processing: boolean) => void;
  selectNextVerse: () => void;
  recitedVerses: {
    [id: string]: RecitedWord[];
  };
  setRecitedVerses: (verseId: number, words: RecitedWord[]) => void;
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapter: null,
  verses: [],
  selectedVerse: null,
  processing: false,
  recitedVerses: {},
  setRecitedVerses: (verseId, words) =>
    set((state) => ({
      recitedVerses: { ...state.recitedVerses, [verseId]: words },
    })),
  setChapter: (chapter) =>
    set({
      chapter,
      recitedVerses: {},
    }),
  setVerses: (verses) => set({ verses }),
  setSelectedVerse: (verse) => {
    if (get().processing) return;
    set({ selectedVerse: verse });
  },
  setProcessing: (processing) => set({ processing }),
  selectNextVerse: () => {
    const { selectedVerse, verses } = get();
    if (get().processing || !selectedVerse) return;
    const next = verses.find(
      (candidate) => candidate.verseNumber === selectedVerse.verseNumber + 1,
    );
    if (next) set({ selectedVerse: next });
  },
}));
