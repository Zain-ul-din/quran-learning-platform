import { Verse } from "@quranjs/api";
import { EventObject, fromCallback } from "xstate";
import { ChapterRecitationWithTiming } from "../types";

export const playVerse = fromCallback<
  EventObject,
  { selectedVerse: Verse; recitation: ChapterRecitationWithTiming | null }
>(({ input, sendBack, receive }) => {
  const { recitation, selectedVerse } = input;
  if (!recitation?.audioUrl) return;

  const audio = new Audio();
  const clip = clipForVerse(recitation, selectedVerse?.verseKey);

  audio.src = recitation.audioUrl;
  audio.onended = () => sendBack({ type: "play.finish" });
  audio.ontimeupdate = clip
    ? () => {
        sendBack({
          type: "play.updateCurrentTime",
          currentTime: audio.currentTime * 1000,
        });

        if (audio.currentTime * 1000 >= clip.endMs) {
          audio.pause();
          sendBack({
            type: "play.finish",
          });
        }
      }
    : null;

  const seek = () => {
    audio.currentTime = clip ? clip.startMs / 1000 : 0;
  };

  audio.onloadedmetadata = seek;
  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) seek();

  audio.play().catch((err) => {
    if (err.name === "AbortError") return;
    console.error("The recitation could not be played", err);
    sendBack({
      type: "play.stop",
    });
  });

  receive((event) => {
    if (event.type === "play.pause") {
      audio?.pause();
      sendBack({
        type: "play.stop",
      });
    }
  });

  return () => {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  };
});

const clipForVerse = (
  recitation: ChapterRecitationWithTiming | null,
  verseKey: string | undefined,
) => {
  if (!verseKey) return null;
  const timestamp = recitation?.timestamps?.find(
    (entry) => entry?.verseKey === verseKey,
  );
  if (!timestamp || typeof timestamp.timestampFrom !== "number") return null;
  if (
    typeof timestamp.timestampTo !== "number" ||
    timestamp.timestampTo <= timestamp.timestampFrom
  ) {
    return null;
  }
  return { startMs: timestamp.timestampFrom, endMs: timestamp.timestampTo };
};
