import { ChapterFooter } from "@/components/chapter/chapter-footer";
import { ChapterHarness } from "@/components/chapter/chapter-harness";
import { ChapterHeader } from "@/components/chapter/chapter-header";
import { Verses } from "@/components/verses/verses";
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
  const [verses, chapter, recitation] = await Promise.all([
    qfClient.content.v4.verses.byChapter(id, {
      fields: { textIndopakNastaleeq: true, textUthmani: true },
      words: true,
      wordFields: {
        textIndopak: true,
        textIndopakNastaleeq: true,
      } as unknown as Record<string, boolean>,
      translations: [20],
      perPage: 50,
      page: 1,
    }),
    qfClient.content.v4.chapters.get(id),
    qfClient.content.v4.audio.chapterRecitation.get("7", id, {
      segments: true,
      fields: {
        id: true,
        chapterId: true,
        segments: true,
        format: true,
        audioUrl: true,
      },
    }),
  ]);

  if (!verses) return notFound();

  return (
    <ChapterHarness chapter={chapter} recitation={recitation}>
      <ChapterHeader chapter={chapter} />
      <Verses verses={verses} />
      <ChapterFooter />
    </ChapterHarness>
  );
}
