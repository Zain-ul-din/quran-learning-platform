import { qfClient } from "@/lib/qf-client";
import { ChapterId } from "@quranjs/api";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export const instant = false;

export default async function Page({
  params,
}: {
  params: Promise<{
    id: ChapterId;
  }>;
}) {
  const { id } = await params;

  await connection();
  const verses = await qfClient.content.v4.verses.byChapter(id, {
    fields: { textIndopakNastaleeq: true, textUthmani: true },
    words: true,
    wordFields: {
      textIndopak: true,
      textIndopakNastaleeq: true,
    } as unknown as Record<string, boolean>,
    translations: [20],
    perPage: 50,
    page: 1,
  });

  if (!verses) return notFound();

  return (
    <main className="max-w-2xl w-full mx-auto border-x">
      <ul
        className="font-arabic space-y-6 divide-y divide-border"
        lang="ar"
        dir="rtl"
      >
        {verses.map((verse) => {
          const wholeVerse = verse.textIndopakNastaleeq!;

          const ayahMarker = wholeVerse.split(" ").at(-1);
          const words = verse.words?.filter(
            (word) => word.charTypeName !== "end",
          );

          return (
            <li className="text-3xl p-4" key={verse.id}>
              <div className="tracking-normal text-balance leading-[2.5]">
                {words?.map((word) => {
                  return (
                    <span
                      className="font-light hover:font-medium hover:text-primary transition-all duration-100 cursor-pointer"
                      key={word.id}
                    >
                      {
                        (word as never as { textIndopakNastaleeq: string })
                          .textIndopakNastaleeq
                      }{" "}
                    </span>
                  );
                })}
                <span
                  className="whitespace-nowrap"
                  aria-label={`Ayah ${verse.verseNumber}`}
                >
                  {ayahMarker}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
