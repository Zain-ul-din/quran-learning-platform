"use client";
import { useEffect, useRef } from "react";
import { cn } from "cn";
import { normalizeQuranEnTranslation } from "@/lib/utils";
import { useChapterStore } from "@/stores/chapter-store";

export function Verses() {
  const { verses, processing, selectedVerse, setSelectedVerse, recitedVerses } =
    useChapterStore();

  const containerRef = useRef<HTMLUListElement>(null);

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
      {verses.map((verse) => {
        const wholeVerse = verse.textIndopakNastaleeq!;
        const ayahMarker = wholeVerse.split(" ").at(-1);
        const words = verse.words?.filter(
          (word) => word.charTypeName !== "end",
        );
        const isActive = selectedVerse && verse.id === selectedVerse.id;
        const recitedWords = recitedVerses[verse.id] ?? [];

        return (
          <li
            className={cn(
              "w-full snap-start px-5 py-9 transition-[color,opacity,background-color] duration-150 ease-[var(--ease-out)] sm:px-8 sm:py-11",
              !isActive && "opacity-40 hover:opacity-50",
              isActive && "bg-secondary/45",
              isActive && processing && "shimmer bg-muted/50",
            )}
            key={verse.id}
            onClick={() => {
              setSelectedVerse(verse);
            }}
            data-verse={`${verse.id}`}
          >
            <div
              lang="ar"
              dir="rtl"
              className="text-right font-arabic font-normal tracking-normal text-3xl text-foreground text-balance leading-[2.35]"
            >
              {words?.map((word) => {
                const recitedWord = recitedWords.find(
                  (rw) => rw.id === word.id,
                );

                return (
                  <span
                    className={cn(
                      "cursor-pointer font-normal transition-colors duration-100 hover:text-primary",
                      recitedWord &&
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
