import { qfClient } from "@/lib/qf-client";
import { cn } from "cn";
import Link from "next/link";

export default async function Page() {
  "use cache";
  const chapters = await qfClient.content.v4.chapters.list();

  return (
    <main className="max-w-2xl w-full mx-auto">
      <header className="border-x p-4 border-b">
        <h1 className="font-medium text-primary">Quran Learning Platform</h1>
      </header>
      <ul className="grid sm:grid-cols-2 gap-2 py-4 px-4 border-x">
        {chapters.map((chapter) => {
          return (
            <li
              className={cn(
                "bg-card border group",
                "hover:bg-secondary hover:text-primary rounded-sm",
              )}
              key={chapter.id}
            >
              <Link
                className="w-full flex justify-between p-4 items-center"
                href={`/chapter/${chapter.id}`}
              >
                <span className="inline-block group-hover:translate-x-1 transition-all duration-200">
                  {chapter.id}. {chapter.nameSimple}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {chapter.versesCount.toString().padStart(3, "0")} Ayahs
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
