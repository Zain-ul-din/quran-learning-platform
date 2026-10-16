"use client";
import { Verse } from "@quranjs/api";
import { use, useEffect, useRef, useState, useTransition } from "react";
import { OpenAISessionContext } from "../providers/openai-session-provider";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mic01Icon } from "@hugeicons/core-free-icons";
import AudioWave02Icon from "@hugeicons/core-free-icons/AudioWave02Icon";
import { motion } from "motion/react";
import { cn } from "cn";
import { play } from "cuelume";
import { normalizeQuranEnTranslation } from "@/lib/utils";
import { useChapterStore } from "@/stores/chapter-store";

export function Verses({ verses }: { verses: Verse[] }) {
  const { clientSecret } = use(OpenAISessionContext);

  const [isPending, startTransition] = useTransition();
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  const finalRef = useRef("");
  const draftRef = useRef("");

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

  const handleOnPracticeAyah = (verseId: number) => {
    finalRef.current = "";
    draftRef.current = "";
    setTranscripts((prev) => ({ ...prev, [verseId]: "" }));

    startTransition(async () => {
      const sourceStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const pc = new RTCPeerConnection();
      setPc(pc);
      pc.addTrack(sourceStream.getAudioTracks()[0], sourceStream);

      const events = pc.createDataChannel("oai-events");
      events.onmessage = ({ data }) => {
        const event = JSON.parse(data);
        console.log(event);

        if (event.type === "session.created") {
          // session created
        }

        if (
          event.type === "conversation.item.input_audio_transcription.delta"
        ) {
          draftRef.current += event.delta;
          setTranscripts((prev) => ({
            ...prev,
            [verseId]: finalRef.current + draftRef.current,
          }));
        }

        if (
          event.type === "conversation.item.input_audio_transcription.completed"
        ) {
          finalRef.current = finalRef.current
            ? `${finalRef.current} ${event.transcript}`
            : event.transcript;
          draftRef.current = "";
          setTranscripts((prev) => ({
            ...prev,
            [verseId]: finalRef.current,
          }));
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        },
      );

      if (!sdpResponse.ok) {
        throw new Error(await sdpResponse.text());
      }

      await pc.setRemoteDescription({
        type: "answer",
        sdp: await sdpResponse.text(),
      });
    });
  };

  return (
    <ul
      ref={containerRef}
      className="space-y-6 divide-y pb-[50dvh] snap-y snap-mandatory scrollbar-none  overflow-y-auto divide-border relative"
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
              "p-4 py-6 w-full snap-start",
              !isActive && "opacity-40 hover:opacity-50",
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
              className="tracking-normal text-3xl  font-arabic text-balance leading-[2.5]"
            >
              {words?.map((word) => {
                const recitedWord = recitedWords.find(
                  (rw) => rw.id === word.id,
                );

                return (
                  <span
                    className={cn(
                      "font-light hover:font-medium hover:text-primary transition-all duration-100 cursor-pointer",
                      recitedWord &&
                        (recitedWord.status === "correct"
                          ? "text-green-600"
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
              <div className="text-foreground/80 mt-6">
                {normalizeQuranEnTranslation(verse?.translations[0].text)}
              </div>
            )}

            {/* actions */}
            <div className="mt-4 hidden">
              <Button
                onClick={() => handleOnPracticeAyah(verse.id)}
                variant={"ghost"}
                size={"sm"}
                disabled={isPending || Boolean(pc)}
                className={cn(pc && "hidden")}
              >
                <HugeiconsIcon icon={Mic01Icon} />{" "}
                <span className="sr-only">Practice Ayah {verse.id}</span>
              </Button>
              {transcripts[verse.id] && (
                <p
                  lang="ar"
                  dir="rtl"
                  className="mt-4 font-arabic text-lg leading-relaxed text-muted-foreground"
                >
                  {transcripts[verse.id]}
                </p>
              )}
            </div>
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
