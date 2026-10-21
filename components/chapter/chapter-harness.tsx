"use client";

import { ReactNode } from "react";
import type { Chapter, Verse } from "@quranjs/api";
import { ChapterStateMachineProvider } from "./chapter-state-machine-context";
import { ChapterRecitationWithTiming } from "@/lib/state-machines/types";

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
  return (
    <ChapterStateMachineProvider
      chapter={chapter}
      recitation={recitation}
      verses={verses}
    >
      <main className="max-w-2xl w-full mx-auto border-x max-h-dvh flex flex-col">
        {children}
      </main>
    </ChapterStateMachineProvider>
  );
}
