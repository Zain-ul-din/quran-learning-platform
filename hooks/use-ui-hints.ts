"use client";
import { useLocalStorage } from "@uidotdev/usehooks";

type Key = "ui.hints.hold-to-recite";

export const useUIHints = (key: Key) => {
  const [dismissed, setDismissed] = useLocalStorage(key, false);
  return {
    visible: !dismissed,
    dismiss: () => setDismissed(true),
    reset: () => setDismissed(false),
  };
};
