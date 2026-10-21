"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@teispace/next-themes";
import { MorphIcon } from "morphicons/react";
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { play } from "cuelume";

// No-op subscribe: we only need the hydration snapshot, not a live subscription.
const emptySubscribe = () => () => {};

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  // Avoid a hydration mismatch: reports false during SSR + first client render,
  // then flips to true (no setState-in-effect).
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    play("toggle", {
      theme: "bubble",
    });
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={"text-foreground/80"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
    >
      {/* Show the theme you'll switch to: Sun in dark, Moon in light. */}
      <MorphIcon icon={isDark ? Sun01Icon : Moon02Icon} strokeWidth={1.5} />
    </Button>
  );
}
