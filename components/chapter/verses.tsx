"use client";
import { use, useEffect, useMemo, useRef } from "react";
import { cn } from "cn";
import { normalizeQuranEnTranslation } from "@/lib/utils";
import { ChapterStateMachineContext } from "./chapter-state-machine-context";

export function Verses() {
  const [state, send] = use(ChapterStateMachineContext);
  const { chapter, verses, selectedVerse, recitation, listeningContext } =
    state.context;

  const mode = useMemo(() => {
    if (state.matches("listening")) return "listening";
    if (state.matches("recitation")) return "recitation";
    return "recitation";
  }, [state]);

  const containerRef = useRef<HTMLUListElement>(null);
  const processing = state.matches("recitation.evaluating" as never);
  const currTime = listeningContext.currentTime ?? 0;

  useEffect(() => {
    const container = containerRef.current;
    const element = container?.querySelector(
      `[data-verse="${selectedVerse?.id}"]`,
    );

    if (!container || !element) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const scrollTop =
      container.scrollTop +
      (elementRect.top - containerRect.top) -
      container.clientTop;

    container.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  }, [selectedVerse?.id]);

  return (
    <ul
      ref={containerRef}
      className={cn(
        "relative flex-1  divide-y divide-border overflow-y-auto pb-[50dvh] scrollbar-none",
      )}
    >
      {verses.map((verse, verseIdx) => {
        const wholeVerse = verse.textIndopakNastaleeq!;
        const ayahMarker = wholeVerse.split(" ").at(-1);
        const words = verse.words?.filter(
          (word) => word.charTypeName !== "end",
        );
        const isActive = selectedVerse && verse.id === selectedVerse.id;
        const recitedWords = state.context.recitedVerses[verse.id] ?? [];

        const timestampSegments =
          recitation?.timestamps?.find((value) => {
            return value.verseKey === `${chapter.id}:${verseIdx + 1}`;
          })?.segments ?? [];

        return (
          <li
            className={cn(
              "w-full snap-start px-5 py-9 transition-[color,opacity,background-color] duration-150 ease-[var(--ease-out)] sm:px-8 sm:py-11",
              !isActive && "opacity-40 hover:opacity-50",
              isActive && "bg-secondary/45",
              isActive && processing && "shimmer bg-muted/50",
            )}
            key={verse.id}
            onClick={() =>
              send({
                type: "verse.update",
                verse: verse,
              })
            }
            data-verse={`${verse.id}`}
          >
            <div
              lang="ar"
              dir="rtl"
              className="text-right font-arabic font-normal tracking-normal text-3xl text-foreground text-balance leading-[2.35]"
            >
              {words?.map((word, idx) => {
                const recitedWord = recitedWords.find(
                  (rw) => rw.id === word.id,
                );
                const [, startMs, endMs] = timestampSegments[idx] ?? [
                  -1, -1, -1,
                ];

                const active = startMs <= currTime && endMs >= currTime;

                return (
                  <span
                    className={cn(
                      "cursor-pointer font-normal transition-colors duration-100 hover:text-primary",
                      mode === "listening"
                        ? active
                          ? "text-foreground"
                          : "text-foreground/50"
                        : recitedWord &&
                            (recitedWord.status === "correct"
                              ? "text-green-600 dark:text-green-500"
                              : "text-red-500 dark:text-red-400"),
                    )}
                    key={word.id}
                  >
                    {
                      (word as never as { textIndopakNastaleeq: string })
                        .textIndopakNastaleeq
                    }{" "}
                  </span>
                );
              })}
              <span
                className="whitespace-nowrap"
                aria-label={`Ayah ${verse.verseNumber}`}
              >
                {ayahMarker}
              </span>
            </div>
            {Array.isArray(verse.translations) && (
              <div className="mt-7 max-w-prose text-sm leading-7 text-foreground/75 sm:text-base">
                {normalizeQuranEnTranslation(verse?.translations[0].text)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
