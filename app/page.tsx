import { qfClient } from "@/lib/qf-client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ChapterCard } from "@/components/chapter/chapter-card";

export default async function Page() {
  "use cache";
  const chapters = await qfClient.content.v4.chapters.list({ language: "en" });

  return (
    <main className="max-w-2xl w-full mx-auto">
      <header className="border-x p-4 border-b flex items-center justify-between">
        <h1 className="font-semibold text-lg bg-(image:--gradient-emerald) bg-clip-text text-transparent">
          Quran Learning Platform
        </h1>
        <ThemeSwitcher />
      </header>
      <ul className="flex flex-col gap-2 py-4 px-4 border-x">
        {chapters.map((chapter) => {
          return <ChapterCard chapter={chapter} key={chapter.id} />;
        })}
      </ul>
    </main>
  );
}
