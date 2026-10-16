"use client";
import { Verse } from "@quranjs/api";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import AudioWave02Icon from "@hugeicons/core-free-icons/AudioWave02Icon";
import { motion } from "motion/react";
import { cn } from "cn";
import { play } from "cuelume";
import { normalizeQuranEnTranslation } from "@/lib/utils";
import { useChapterStore } from "@/stores/chapter-store";

export function Verses({ verses }: { verses: Verse[] }) {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  const { processing, selectedVerse, setSelectedVerse, recitedVerses } =
    useChapterStore();
  const setVerses = useChapterStore((state) => state.setVerses);

  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const firstVerse = verses[0];
    console.log("setting first verse: ", firstVerse);
    setVerses(verses);
    setSelectedVerse(firstVerse);
  }, [verses, setSelectedVerse, setVerses]);

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
      className="relative flex-1 snap-y snap-mandatory divide-y divide-border overflow-y-auto pb-[50dvh] scrollbar-none"
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
              "w-full snap-start px-5 py-9 transition-colors sm:px-8 sm:py-11",
              !isActive && "opacity-40 hover:opacity-50",
              isActive && "bg-secondary/45",
              isActive && processing && "shimmer bg-muted/50",
            )}
            // shadow-[inset_0px_0px_4px_1px] shadow-green-300
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
                          : "text-red-500"),
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

      {pc && (
        <motion.div
          initial={{
            translateY: "4rem",
          }}
          animate={{
            translateY: "0rem",
          }}
          onAnimationComplete={() => {
            play("open", {
              theme: "bubble",
            });
          }}
          className="fixed bottom-4 -translate-x-1/2 left-1/2"
        >
          <div className="px-4 w-fit bg-background/20 border py-2 rounded-md">
            <Button
              onClick={() => {
                pc.close();
                setPc(null);
                play("close", {
                  theme: "bubble",
                });
              }}
              variant={"destructive"}
              className={"hover:scale-105"}
            >
              <HugeiconsIcon icon={AudioWave02Icon} />
              Stop Recording{" "}
              <span className="animate-bounce transition-all delay-100 inline-block">
                .
              </span>
              <span className="animate-bounce -translate-x-1 transition-all delay-150 inline-block">
                .
              </span>
              <span className="animate-bounce -translate-x-2 transition-all delay-200 inline-block">
                .
              </span>
            </Button>
          </div>
        </motion.div>
      )}
    </ul>
  );
}
