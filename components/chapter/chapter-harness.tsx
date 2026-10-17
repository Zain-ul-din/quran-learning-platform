"use client";

import { ReactNode, useEffect } from "react";
import type { Chapter } from "@quranjs/api";
import {
  useChapterStore,
  type ChapterRecitationWithTiming,
} from "@/stores/chapter-store";

export function ChapterHarness({
  chapter,
  recitation,
  children,
}: {
  chapter: Chapter;
  recitation?: ChapterRecitationWithTiming | null;
  children: ReactNode;
}) {
  const setChapter = useChapterStore((state) => state.setChapter);
  const setRecitation = useChapterStore((state) => state.setRecitation);

  useEffect(() => {
    setChapter(chapter);
    setRecitation(recitation ?? null);
  }, [chapter, recitation, setChapter, setRecitation]);

  return (
    <main className="max-w-2xl w-full mx-auto border-x max-h-dvh flex flex-col">
      {children}
    </main>
  );
}
