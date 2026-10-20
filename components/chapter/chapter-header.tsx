"use client";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { useRouter } from "next/navigation";
import { play } from "cuelume";
import { useChapterStore } from "@/stores/chapter-store";

export function ChapterHeader() {
  const router = useRouter();
  const { chapter } = useChapterStore();

  if (!chapter) return null;

  return (
    <header className="relative border-b bg-card p-4 py-6 flex items-center w-full  overflow-hidden">
      <div className="flex items-center w-full justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-semibold flex items-center text-xl bg-(image:--gradient-emerald) bg-clip-text text-transparent truncate">
            <Button
              size={"icon"}
              variant={"ghost"}
              className={"mr-2"}
              onClick={() => {
                void play("press", { theme: "bubble" });
                router.push("/");
              }}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="text-foreground size-5"
              />
            </Button>{" "}
            {chapter.id}. {chapter.nameSimple}
          </h1>
        </div>
        <span
          lang="ar"
          dir="rtl"
          className="font-arabic text-3xl leading-none text-primary shrink-0"
        >
          {chapter.nameArabic}
        </span>
      </div>
    </header>
  );
}
