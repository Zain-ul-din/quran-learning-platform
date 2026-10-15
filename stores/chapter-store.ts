"use client";
import { create } from "zustand";
import type { Chapter, Verse } from "@quranjs/api";

interface ChapterState {
  chapter: Chapter | null;
  selectedVerse: Verse | null;

  setChapter: (chapter: Chapter) => void;
  setSelectedVerse: (verse: Verse | null) => void;
}

export const useChapterStore = create<ChapterState>((set) => ({
  chapter: null,
  selectedVerse: null,

  setChapter: (chapter) =>
    set({
      chapter,
    }),
  setSelectedVerse: (verse) => set({ selectedVerse: verse }),
}));
