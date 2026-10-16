"use client";
import { Chapter } from "@quranjs/api";
import { cn } from "cn";
import { play } from "cuelume";
import Link from "next/link";

export function ChapterCard({
  chapter,
  index,
}: {
  chapter: Chapter;
  index: number;
}) {
  const isFirstChapter = index === 0;

  return (
    <li
      className={cn(
        index % 2 === 0 ? "flex justify-start" : "flex justify-end",
        "card-enter",
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <Link
        className={cn(
          "group relative flex w-[calc(50%+2.75rem)] min-w-0 items-center gap-2 rounded-2xl border bg-card p-2.5 shadow-sm sm:w-[calc(50%+3.25rem)] sm:min-w-[255px] sm:gap-3 sm:p-3",
          "transition-[transform,border-color,box-shadow] duration-200 ease-[var(--ease-out)]",
          "hover:border-primary/50 hover:bg-secondary hover:shadow-md",
          "fine-hover:hover:-translate-y-0.5",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
        )}
        onClick={() => play("press", { theme: "bubble" })}
        href={`/chapter/${chapter.id}`}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 grid size-[52px] -translate-y-1/2 place-items-center rounded-full border-4 border-background transition-transform duration-200 ease-[var(--ease-out)] fine-hover:group-hover:scale-105 sm:size-[58px]",
            index % 2 === 0
              ? "-right-[3.5rem] sm:-right-[4.15rem]"
              : "-left-[3.5rem] sm:-left-[4.15rem]",
            isFirstChapter
              ? "bg-primary text-primary-foreground shadow-[inset_0_-5px_0_color-mix(in_oklab,var(--primary),black_18%)]"
              : "bg-secondary text-primary shadow-[inset_0_-5px_0_var(--border)]",
          )}
        >
          <span className="text-base font-bold tabular-nums">
            {chapter.id}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-foreground">
            {chapter.nameSimple}
          </span>
          <span className="mt-0.5 block truncate text-xs font-medium text-primary">
            {chapter.translatedName.name}
          </span>
          <span className="mt-1 block truncate text-[11px] text-muted-foreground">
            <span className="capitalize">{chapter.revelationPlace}</span>
            <span className="mx-1 text-border">•</span>
            {chapter.versesCount} Verses
          </span>
        </span>

        <span
          lang="ar"
          dir="rtl"
          className="shrink-0 font-arabic text-2xl leading-none text-primary"
        >
          {chapter.nameArabic}
        </span>
      </Link>
    </li>
  );
}
