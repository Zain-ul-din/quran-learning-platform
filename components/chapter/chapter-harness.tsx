"use client";

import { ReactNode, useEffect } from "react";
import type { Chapter } from "@quranjs/api";
import { useChapterStore } from "@/stores/chapter-store";

export function ChapterHarness({
  chapter,
  children,
}: {
  chapter: Chapter;
  children: ReactNode;
}) {
  const setChapter = useChapterStore((state) => state.setChapter);

  useEffect(() => {
    setChapter(chapter);
  }, [chapter, setChapter]);

  return (
    <main className="max-w-2xl w-full mx-auto border-x max-h-dvh flex flex-col">
      {children}
    </main>
  );
}
