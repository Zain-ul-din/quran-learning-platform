"use client";

import { use, useCallback, useEffect, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AudioWave02Icon,
  Mic01Icon,
  PauseIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";
import { RecordVisualizer } from "@/components/chapter/record-visualizer";
import { Spinner } from "@/components/ui/spinner";
import {
  ElevatedButton,
  type ElevatedButtonVariant,
} from "@/components/ui/elevated-button";

import { motion } from "motion/react";
import { useUIHints } from "@/hooks/use-ui-hints";
import { ChapterStateMachineContext } from "./chapter-state-machine-context";
import { formatElapsed } from "@/lib/utils";
import { play } from "cuelume";

export function ChapterFooter() {
  const [state, send] = use(ChapterStateMachineContext);
  const { recitationContext } = state.context;

  const elapsedMs = recitationContext.elapsedMs ?? 0;
  const reciteTooltipHint = useUIHints("ui.hints.hold-to-recite");
  const playing = state.matches("listening");
  const error = recitationContext.error;

  const beginHold = useCallback(() => {
    reciteTooltipHint.dismiss();
    send({ type: "RECORD" });
  }, [send, reciteTooltipHint]);

  const endHold = useCallback(() => send({ type: "STOP" }), [send]);

  useEffect(() => {
    const releaseHold = () => endHold();
    window.addEventListener("pointerup", releaseHold);
    window.addEventListener("pointercancel", releaseHold);
    window.addEventListener("blur", endHold);

    return () => {
      window.removeEventListener("pointerup", releaseHold);
      window.removeEventListener("pointercancel", releaseHold);
      window.removeEventListener("blur", endHold);
    };
  }, [endHold]);

  const variant = useMemo<Partial<ElevatedButtonVariant>>(() => {
    if (state.matches("recitation.recording" as never)) return "destructive";
    if (state.matches("recitation.evaluating" as never)) return "secondary";
    return "primary";
  }, [state]);

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

  const hint = useMemo(() => {
    if (state.matches("recitation.evaluating" as never))
      return "Checking your recitation…";
    if (state.matches("recitation.recording" as never))
      return "Release to stop";
    return "Select a verse to start recording";
  }, [state]);

  const isRecording = state.matches("recitation.recording" as never);
  const isEvaluating = state.matches("recitation.evaluating" as never);

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 pointer-events-none flex justify-center">
      <div className="relative flex w-full max-w-2xl  flex-col items-center  px-4 pb-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-background via-background/30 to-transparent"
        />

        <div className="flex items-center gap-2">
          <ElevatedButton
            variant={variant}
            size="wide"
            disabled={isEvaluating}
            aria-label={
              isRecording
                ? "Release to stop recording"
                : "Hold to record your recitation"
            }
            className="pointer-events-auto"
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
            onBlur={endHold}
          >
            {reciteTooltipHint.visible && (
              <motion.div
                initial={{
                  scaleX: 0,
                  scaleY: 0.2,
                }}
                animate={{
                  scaleX: 1,
                  scaleY: 1,
                }}
                transition={{
                  delay: 1,
                }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-5 
                   bg-foreground/80 text-background p-2 whitespace-nowrap rounded-md 
                   text-base font-medium shadow-sm
                   before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 
                   before:border-[6px] before:border-solid 
                   before:border-t-foreground/80 before:border-r-transparent before:border-b-transparent before:border-l-transparent"
              >
                Finish the Ayah to see your results.
              </motion.div>
            )}
            <span className="grid place-items-center">
              {isEvaluating ? (
                <Spinner className="size-5" />
              ) : isRecording ? (
                <RecordVisualizer
                  stream={recitationContext.stream ?? null}
                  active={isRecording}
                  bars={5}
                />
              ) : (
                <HugeiconsIcon
                  icon={Mic01Icon}
                  strokeWidth={1.75}
                  className="size-5"
                />
              )}
            </span>
            <span>{isRecording ? "Release to stop" : "Hold to recite"}</span>
          </ElevatedButton>

          <ElevatedButton
            variant="play"
            onClick={() => {
              play("select", { theme: "bubble" });
              send({
                type: !playing ? "LISTEN" : "PAUSE",
              });
            }}
            className="pointer-events-auto"
          >
            <span className="grid place-items-center">
              <HugeiconsIcon
                icon={playing ? PauseIcon : AudioWave02Icon}
                strokeWidth={1.75}
                className="size-5"
              />
            </span>
            <span className="sr-only">
              {playing ? "Pause" : "Play"} the reference recitation
            </span>
          </ElevatedButton>
        </div>

        <div
          className="flex items-center gap-2 text-xs mt-4"
          aria-live="polite"
        >
          {isRecording && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-medium tabular-nums text-red-600 dark:text-red-400">
              <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
              {formatElapsed(elapsedMs)}
            </span>
          )}
          {isEvaluating && (
            <Spinner className="size-3.5 text-muted-foreground" />
          )}
          <span
            className={cn(
              error
                ? "text-destructive"
                : isRecording
                  ? "text-foreground"
                  : "text-muted-foreground",
            )}
          >
            {error ?? hint}
          </span>
        </div>
      </div>
    </footer>
  );
}
