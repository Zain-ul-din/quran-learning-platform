import { qfClient } from "@/lib/qf-client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ChapterCard } from "@/components/chapter/chapter-card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default async function Page() {
  "use cache";
  const chapters = await qfClient.content.v4.chapters.list({ language: "en" });

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto min-h-screen w-full max-w-2xl border-x">
        <header className="sticky top-0 z-20 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h1 className="bg-(image:--gradient-emerald) bg-clip-text text-lg font-bold text-transparent">
                Quran Learning Platform
              </h1>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="https://github.com/Zain-ul-din/quran-learning-platform"
                target="_blank"
              >
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  className={"text-foreground/80"}
                >
                  <HugeiconsIcon icon={GithubIcon} className="size-4" />
                </Button>
              </Link>
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        <section className="w-full px-4 pb-16 pt-8 sm:px-6 sm:pt-11">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              Start your Quran learning journey
            </h2>
          </div>

          <div className="relative mx-auto max-w-md">
            <div
              aria-hidden
              className="absolute bottom-10 left-1/2 top-10 w-1 -translate-x-1/2 rounded-full bg-[repeating-linear-gradient(to_bottom,var(--border)_0_10px,transparent_10px_18px)]"
            />
            <ul className="relative flex flex-col gap-6">
              {chapters.map((chapter, index) => (
                <ChapterCard chapter={chapter} index={index} key={chapter.id} />
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
