import { Chapter } from "@quranjs/api";

export function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <header className="relative border-b bg-card p-4 flex items-center w-full  overflow-hidden">
      <div className="flex items-center w-full justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-semibold text-xl bg-(image:--gradient-emerald) bg-clip-text text-transparent truncate">
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
