import { Chapter } from "@quranjs/api";
import { cn } from "cn";
import Link from "next/link";

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <li key={chapter.id}>
      <Link
        className={cn(
          "group flex items-center gap-4 rounded-xl border bg-card p-3.5",
          "transition-colors duration-200",
          "hover:border-primary/40 hover:bg-secondary",
        )}
        href={`/chapter/${chapter.id}`}
      >
        {/* Circular emerald-ringed number badge */}
        <span className="relative grid size-11 shrink-0 place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-primary/40 transition-colors duration-200 group-hover:border-primary"
          />
          <span className="text-sm font-semibold text-primary tabular-nums">
            {chapter.id}
          </span>
        </span>

        {/* Name + translation, revelation place · verses */}
        <span className="min-w-0 flex-1">
          <span className="block truncate">
            <span className="font-semibold text-foreground">
              {chapter.nameSimple}
            </span>{" "}
            <span className="text-muted-foreground">
              ({chapter.translatedName.name})
            </span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            <span className="capitalize">{chapter.revelationPlace}</span>
            <span className="mx-1">·</span>
            {chapter.versesCount} Verses
          </span>
        </span>

        {/* Arabic name */}
        <span
          lang="ar"
          dir="rtl"
          className="font-arabic text-2xl leading-none text-primary shrink-0"
        >
          {chapter.nameArabic}
        </span>
      </Link>
    </li>
  );
}
