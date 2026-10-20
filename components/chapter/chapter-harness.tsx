"use client";

import { ReactNode, useEffect } from "react";
import type { Chapter, Verse } from "@quranjs/api";
import {
  useChapterStore,
  type ChapterRecitationWithTiming,
} from "@/stores/chapter-store";

export function ChapterHarness({
  chapter,
  recitation,
  children,
  verses,
}: {
  chapter: Chapter;
  recitation?: ChapterRecitationWithTiming | null;
  children: ReactNode;
  verses: Verse[];
}) {
  const setChapter = useChapterStore((state) => state.setChapter);
  const setRecitation = useChapterStore((state) => state.setRecitation);

  const { setVerses, setSelectedVerse } = useChapterStore();

  useEffect(() => {
    setChapter(chapter);
    setRecitation(recitation ?? null);
  }, [chapter, recitation, setChapter, setRecitation]);

  useEffect(() => {
    setVerses(verses);
    const firstVerse = verses[0];
    if (firstVerse) setSelectedVerse(firstVerse);
  }, [verses, setSelectedVerse, setVerses]);

  return (
    <main className="max-w-2xl w-full mx-auto border-x max-h-dvh flex flex-col">
      {children}
    </main>
  );
}
