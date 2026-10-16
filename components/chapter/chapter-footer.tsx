"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useMicrophone, VoiceBeam } from "voice-glow";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mic01Icon } from "@hugeicons/core-free-icons";
import { press, release } from "cuelume";
import { cn } from "cn";
import { useShallow } from "zustand/react/shallow";

import { RecordVisualizer } from "@/components/chapter/record-visualizer";
import { Spinner } from "@/components/ui/spinner";
import { useChapterStore, type RecitedWord } from "@/stores/chapter-store";
import { safeJsonParse } from "@/lib/utils";
import type { RecitedVerseOutputSchema } from "@/lib/schema";

type Phase = "idle" | "requesting" | "recording" | "processing" | "error";

type Tone = {
  face: string;
  ring: string;
  shadow: string;
  glow: string;
};

/**
 * Button colours, one entry per phase — restyle the control by editing these
 * strings (gradients, glyph colour, ring, shadow and glow) only.
 */
const TONES: Record<Phase, Tone> = {
  idle: {
    face: "bg-gradient-to-b from-card via-card to-muted text-primary",
    ring: "border border-border",
    shadow: "shadow-[0_20px_40px_-24px_rgba(16,32,26,0.25)]",
    glow: "bg-primary/10",
  },
  requesting: {
    face: "bg-gradient-to-b from-card via-card to-muted text-primary",
    ring: "border border-border/80",
    shadow: "shadow-[0_20px_40px_-24px_rgba(16,32,26,0.65)]",
    glow: "bg-primary/25",
  },
  recording: {
    face: "bg-gradient-to-b from-rose-500 via-red-500 to-red-600 text-white",
    ring: "border border-red-400/50",
    shadow: "shadow-[0_22px_44px_-16px_rgba(225,29,72,0.8)]",
    glow: "bg-red-500/35",
  },
  processing: {
    face: "bg-gradient-to-b from-primary via-emerald-600 to-emerald-700 text-primary-foreground",
    ring: "border border-emerald-400/50",
    shadow: "shadow-[0_22px_44px_-18px_rgba(16,185,129,0.65)]",
    glow: "bg-primary/30",
  },
  error: {
    face: "bg-gradient-to-b from-card via-card to-muted text-destructive",
    ring: "border border-destructive/50",
    shadow: "shadow-[0_20px_40px_-24px_rgba(16,32,26,0.65)]",
    glow: "bg-destructive/25",
  },
};

/** Below this the clip is too thin to score, so it is dropped silently. */
const MIN_HOLD_MS = 300;

/**
 * `navigator.mediaDevices` cannot be probed while rendering on the server, so
 * the check goes through `useSyncExternalStore`: the server (and the
 * hydrating client) both see the optimistic `true`, and the real answer lands
 * right after hydration instead of fighting the server-rendered markup.
 */
const subscribeNothing = () => () => {};
const readMicSupport = () =>
  typeof navigator !== "undefined" &&
  Boolean(navigator.mediaDevices?.getUserMedia);
const readMicSupportOnServer = () => true;

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ChapterFooter() {
  const microphone = useMicrophone();
  const {
    start: startMic,
    stop: stopMic,
    stream,
    state: micState,
  } = microphone;
  const supported = useSyncExternalStore(
    subscribeNothing,
    readMicSupport,
    readMicSupportOnServer,
  );

  const { chapter, verse } = useChapterStore(
    useShallow((state) => ({
      chapter: state.chapter,
      verse: state.selectedVerse,
    })),
  );
  const setRecitedVerses = useChapterStore((state) => state.setRecitedVerses);
  const selectNextVerse = useChapterStore((state) => state.selectNextVerse);

  const [phase, setPhaseState] = useState<Phase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  const phaseRef = useRef<Phase>("idle");
  const holdingRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const isRecording = phase === "recording";
  const ready = Boolean(chapter && verse) && supported;

  const applyRecited = useCallback(
    (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;

      const { selectedVerse } = useChapterStore.getState();
      if (!selectedVerse?.words?.length) return;

      const recitedWords = Object.entries(
        payload as Record<string, RecitedVerseOutputSchema>,
      )
        .map(([key, output]) => {
          if (!output || typeof output !== "object") return null;
          const wordId = Number(key.split("_")[0]);
          const word = selectedVerse.words!.find((w) => w.id === wordId);
          if (!word) return null;
          return { ...word, ...output } as RecitedWord;
        })
        .filter((word): word is RecitedWord => word !== null);

      if (recitedWords.length > 0) {
        setRecitedVerses(selectedVerse.id, recitedWords);
      }
    },
    [setRecitedVerses],
  );

  /**
   * Uploads the clip, paints the score into the store, and resolves `true`
   * when every word came back correct.
   */
  const sendAudio = useCallback(
    async (blob: Blob): Promise<boolean> => {
      const { chapter, selectedVerse } = useChapterStore.getState();
      if (!chapter || !selectedVerse) return false;

      const formData = new FormData();
      const extension = blob.type.includes("mp4") ? "m4a" : "webm";
      formData.append(
        "audio",
        new File([blob], `recording.${extension}`, { type: blob.type }),
      );
      formData.append(
        "context",
        JSON.stringify({ chapter, verse: selectedVerse }),
      );

      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });
      if (!response.ok || !response.body) {
        throw new Error(`process-audio responded with ${response.status}`);
      }

      // The route streams the score as a single JSON object — read to the
      // end, then parse once.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (value) text += decoder.decode(value, { stream: true });
        if (done) break;
      }
      text += decoder.decode();

      const score: Record<string, RecitedVerseOutputSchema> | null =
        safeJsonParse(text);
      if (!score) throw new Error("process-audio sent a malformed score");

      applyRecited(score);
      return Object.values(score).every((word) => word.status === "correct");
    },
    [applyRecited],
  );

  const startRecorder = useCallback(
    (mediaStream: MediaStream) => {
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(mediaStream);
      } catch (err) {
        console.error("This browser cannot record audio", err);
        stopMic();
        setPhase("error");
        return;
      }

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        // The clip is final — let the microphone go whatever happens next.
        stopMic();

        const heldMs = Date.now() - startedAtRef.current;
        if (blob.size === 0 || heldMs < MIN_HOLD_MS) {
          setPhase("idle");
          return;
        }

        setPhase("processing");
        sendAudio(blob)
          .then((allCorrect) => {
            setPhase("idle");
            // A perfect recitation moves the learner on to the next ayah.
            if (allCorrect) selectNextVerse();
          })
          .catch((err) => {
            console.error(err);
            setPhase("error");
          });
      };
      recorder.addEventListener("error", (event) => {
        console.error("Recording failed", event);
        if (phaseRef.current === "recording") setPhase("error");
      });

      recorder.start();
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setPhase("recording");
    },
    [sendAudio, selectNextVerse, setPhase, stopMic],
  );

  /** Press-and-hold begins: ask for the mic, then roll as soon as it lands. */
  const beginHold = useCallback(async () => {
    if (!ready || holdingRef.current) return;
    const current = phaseRef.current;
    if (
      current === "requesting" ||
      current === "recording" ||
      current === "processing"
    ) {
      return;
    }

    holdingRef.current = true;
    press("tap", { theme: "bubble" });
    setPhase("requesting");

    let mediaStream: MediaStream | null = null;
    try {
      mediaStream = await startMic();
    } catch (err) {
      console.error(err);
    }

    // Let go while the permission prompt was still up — nothing to record.
    if (!mediaStream || !holdingRef.current) {
      if (mediaStream) stopMic();
      holdingRef.current = false;
      if (phaseRef.current === "requesting") setPhase("idle");
      return;
    }

    if (verse) setRecitedVerses(verse.id, []);
    startRecorder(mediaStream);
  }, [
    ready,
    startMic,
    stopMic,
    setPhase,
    startRecorder,
    verse,
    setRecitedVerses,
  ]);

  /** Letting go (or leaving) ends the recording and sends the audio off. */
  const endHold = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    release("tap");

    // Still waiting on the permission dialog — beginHold() cleans up for us.
    if (phaseRef.current !== "recording") return;

    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (!recorder || recorder.state === "inactive") {
      setPhase("idle");
      return;
    }

    try {
      // `onstop` finalizes the clip, stops the mic and uploads it.
      recorder.stop();
    } catch (err) {
      console.error(err);
      stopMic();
      setPhase("idle");
    }
  }, [setPhase, stopMic]);

  /**
   * Losing focus only matters mid-recording — the microphone permission
   * prompt blurs the page, and cancelling the hold there would drop the clip
   * the user is in the middle of taking.
   */
  const endHoldIfRecording = useCallback(() => {
    if (phaseRef.current === "recording") endHold();
  }, [endHold]);

  // Releasing outside the button or cancelling the gesture always ends the
  // hold — the recording never outlives the press.
  useEffect(() => {
    const releaseHold = () => endHold();
    window.addEventListener("pointerup", releaseHold);
    window.addEventListener("pointercancel", releaseHold);
    window.addEventListener("blur", endHoldIfRecording);

    return () => {
      window.removeEventListener("pointerup", releaseHold);
      window.removeEventListener("pointercancel", releaseHold);
      window.removeEventListener("blur", endHoldIfRecording);
    };
  }, [endHold, endHoldIfRecording]);

  useEffect(() => {
    return () => {
      holdingRef.current = false;
      const recorder = recorderRef.current;
      recorderRef.current = null;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          /* already gone */
        }
      }
      stopMic();
    };
  }, [stopMic]);

  // Ticking clock while the user is speaking; `startRecorder` zeroes it.
  useEffect(() => {
    if (phase !== "recording") return;
    const id = window.setInterval(
      () => setElapsedMs(Date.now() - startedAtRef.current),
      250,
    );
    return () => window.clearInterval(id);
  }, [phase]);

  const tone = TONES[phase];

  const hint = !supported
    ? "Recording is not supported in this browser"
    : !ready
      ? "Select a verse to start reciting"
      : phase === "requesting"
        ? "Waiting for microphone access…"
        : phase === "recording"
          ? "Release to stop"
          : phase === "processing"
            ? "Checking your recitation…"
            : phase === "error"
              ? "Something went wrong — try again"
              : micState === "denied"
                ? "Microphone blocked — allow it to continue"
                : "Hold to recite";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (event.repeat) return;
    void beginHold();
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    endHold();
  };

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-2 px-4 pt-14 pb-6">
        {/* Scrolling verses fade out behind the control. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/50 to-transparent"
        />

        {/*
          The beam must NOT carry `-z-10`: it is `position: relative`, so a
          negative z-index drops it below this wrapper div — the div then wins
          the hit test over the button and every press is swallowed.
        */}
        <VoiceBeam
          className="flex justify-center p-5"
          stream={stream}
          type="pill"
          theme="auto"
          colorVariant={isRecording ? "sunset" : "forest"}
          active={Boolean(stream)}
          borderRadius={9999}
          scale={0.9}
        >
          <button
            type="button"
            disabled={!ready}
            aria-label={
              isRecording
                ? "Release to stop recording"
                : "Hold to record your recitation"
            }
            className={cn(
              "group relative isolate grid size-[76px] place-items-center rounded-full",
              "touch-none select-none",
              "transition-[transform,box-shadow,color] duration-200 ease-out",
              "outline-none focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-60",
              isRecording ? "scale-105" : "active:scale-95",
              tone.face,
              tone.ring,
              tone.shadow,
            )}
            onPointerDown={(event) => {
              if (event.button !== 0 || !event.isPrimary) return;
              void beginHold();
            }}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onBlur={endHoldIfRecording}
          >
            {/* Specular sheen — the physical-key highlight. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/45 via-white/5 to-black/10 dark:from-white/20 dark:via-white/5 dark:to-black/30"
            />
            {/* Halo blooming out of the face while recording. */}
            {isRecording && (
              <>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-full border border-red-400/70 animate-ping [animation-duration:2.4s]"
                />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -inset-4 rounded-full blur-lg animate-pulse",
                    tone.glow,
                  )}
                />
              </>
            )}

            <span className="relative z-10 grid place-items-center">
              {phase === "processing" ? (
                <Spinner className="size-7" />
              ) : isRecording ? (
                <RecordVisualizer
                  stream={stream}
                  active={isRecording}
                  bars={7}
                />
              ) : (
                <HugeiconsIcon
                  icon={Mic01Icon}
                  strokeWidth={1.75}
                  className="size-8"
                />
              )}
            </span>
          </button>
        </VoiceBeam>

        <div className="flex h-6 items-center gap-2 text-xs" aria-live="polite">
          {isRecording && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-medium tabular-nums text-red-600 dark:text-red-400">
              <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
              {formatElapsed(elapsedMs)}
            </span>
          )}
          {phase === "processing" && (
            <Spinner className="size-3.5 text-muted-foreground" />
          )}
          <span
            className={cn(
              isRecording ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {hint}
          </span>
        </div>
      </div>
    </footer>
  );
}
