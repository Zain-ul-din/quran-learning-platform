"use client";
import { useSyncExternalStore } from "react";

type Key = "ui.hints.hold-to-recite";

/**
 * `@uidotdev/usehooks`' `useLocalStorage` throws from its server snapshot
 * ("useLocalStorage is a client-only hook"), and client components are still
 * server-rendered by the App Router — so it 500s any route that renders it.
 * This is the same `useSyncExternalStore` pattern as `theme-switcher.tsx`:
 * the server (and the hydrating client) see the optimistic default, and the
 * stored value lands right after hydration instead of fighting the markup.
 */

const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  // Keep cross-tab dismissal in sync.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

const read = (key: Key) => {
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
    return false;
  }
};

const readOnServer = () => false;

const write = (key: Key, dismissed: boolean) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(dismissed));
  } catch {
    // Ignore quota/permission failures; the hint just stays dismissed for this session.
  }
  listeners.forEach((notify) => notify());
};

export const useUIHints = (key: Key) => {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => read(key),
    readOnServer,
  );
  return {
    visible: !dismissed,
    dismiss: () => write(key, true),
    reset: () => write(key, false),
  };
};
