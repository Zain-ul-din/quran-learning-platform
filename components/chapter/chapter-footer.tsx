"use client";

import { useMicrophone, VoiceBeam } from "voice-glow";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AudioWave01Icon } from "@hugeicons/core-free-icons";
import { play } from "cuelume";
import { useRef } from "react";
import { Chapter, Verse } from "@quranjs/api";
import { useChapterStore } from "@/stores/chapter-store";

import { useShallow } from "zustand/react/shallow";

async function sendAudio(
  blob: Blob,
  context: {
    chapter: Chapter;
    verse: Verse;
  },
) {
  const formData = new FormData();
  const extension = blob.type.includes("mp4") ? "m4a" : "webm";
  formData.append(
    "audio",
    new File([blob], `recording.${extension}`, { type: blob.type }),
  );
  formData.append("context", JSON.stringify(context));
  await fetch("/api/process-audio", { method: "POST", body: formData });
}

export function ChapterFooter() {
  const microphone = useMicrophone();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { chapter, verse } = useChapterStore(
    useShallow((v) => {
      return {
        chapter: v.chapter!,
        verse: v.selectedVerse!,
      };
    }),
  );

  const handleToggle = async () => {
    if (microphone.state !== "idle") {
      play("close", { theme: "bubble" });
      // Finalize the recording; `onstop` assembles the blob and POSTs it.
      recorderRef.current?.stop();
      recorderRef.current = null;
      microphone.stop();
      return;
    }

    play("open", { theme: "bubble" });
    const stream = await microphone.start();
    if (stream == null) return;

    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });
      chunksRef.current = [];

      if (blob.size > 0) void sendAudio(blob, { chapter, verse });
    };

    recorder.start();
    recorderRef.current = recorder;
  };

  return (
    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2  w-full flex justify-center items-center">
      <VoiceBeam
        className="p-4 pb-8 max-w-2xl w-full -z-10"
        stream={microphone.stream}
        onClick={handleToggle}
      >
        <div className="md:w-2xl flex justify-center z-40 isolate">
          <Button
            size={"lg"}
            variant={microphone.state === "live" ? "outline" : "default"}
            className={"hover:scale-110 transition-all"}
          >
            <HugeiconsIcon icon={AudioWave01Icon} />
            {microphone.state === "idle" ? "Start Reciting" : "Stop Reciting"}
          </Button>
        </div>
      </VoiceBeam>
    </footer>
  );
}
