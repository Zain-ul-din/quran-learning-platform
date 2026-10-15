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
      <Verses verses={verses} />
    </main>
  );
}
