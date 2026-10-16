"use client";
import { create } from "zustand";
import type { Chapter, Verse, Word } from "@quranjs/api";
import { RecitedVerseOutputSchema } from "@/lib/schema";

export type RecitedWord = Word & RecitedVerseOutputSchema;

interface ChapterState {
  chapter: Chapter | null;
  /** Every ayah of the current chapter, pushed in by `Verses`. */
  verses: Verse[];
  selectedVerse: Verse | null;
  setChapter: (chapter: Chapter) => void;
  setVerses: (verses: Verse[]) => void;
  setSelectedVerse: (verse: Verse | null) => void;
  /** Selects the ayah after the current one, when the chapter has one. */
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
  recitedVerses: {},
  setRecitedVerses: (verseId, words) =>
    set((state) => ({
      recitedVerses: { ...state.recitedVerses, [verseId]: words },
    })),
  // `verses` and `selectedVerse` are deliberately not reset here: `Verses`
  // pushes the new chapter's list and first ayah in a child effect, which runs
  // *before* this parent effect, so clearing either would wipe them on
  // navigation.
  setChapter: (chapter) =>
    set({
      chapter,
      recitedVerses: {},
    }),
  setVerses: (verses) => set({ verses }),
  setSelectedVerse: (verse) => set({ selectedVerse: verse }),
  selectNextVerse: () => {
    const { selectedVerse, verses } = get();
    if (!selectedVerse) return;
    const next = verses.find(
      (candidate) => candidate.verseNumber === selectedVerse.verseNumber + 1,
    );
    if (next) set({ selectedVerse: next });
  },
}));
