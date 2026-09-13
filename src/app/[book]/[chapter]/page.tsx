import { notFound } from "next/navigation";

import { BibleLayout } from "@/components/templates/BibleLayout";
import { ChapterView } from "@/components/organisms/ChapterView";
import { ChapterNav } from "@/components/organisms/ChapterNavigation";
import { getBibleRepository } from "@/repositories/bible";
import { BibleService } from "@/services/bible";

type Props = {
  params: Promise<{ book: string; chapter: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { book: bookId, chapter } = await params;
  const service = new BibleService(getBibleRepository());
  const book = await service.getBook(bookId);
  if (!book) return { title: "No encontrado" };
  const n = Number.parseInt(chapter, 10);
  if (!Number.isInteger(n) || n < 1) return { title: "No encontrado" };
  return { title: `${book.title} ${n} · Biblia` };
}

export default async function ChapterPage({ params }: Props) {
  const { book: bookId, chapter } = await params;
  const n = Number.parseInt(chapter, 10);
  const valid = Number.isInteger(n) && n > 0;

  const service = new BibleService(getBibleRepository());
  const [book, chapterData, navigation] = await Promise.all([
    service.getBook(bookId),
    valid ? service.getChapter(bookId, n) : Promise.resolve(null),
    valid
      ? service.getChapterNavigation(bookId, n)
      : Promise.resolve({ prev: null, next: null }),
  ]);

  if (!book) notFound();
  if (!chapterData) notFound();

  return (
    <BibleLayout
      crumbs={[
        { label: book.title, href: `/${book.id}` },
        { label: `Capítulo ${chapterData.number}` },
      ]}
    >
      <ChapterView chapter={chapterData} />
      <ChapterNav
        navigation={navigation}
        currentLabel={`${book.abbreviation} ${chapterData.number}`}
      />
    </BibleLayout>
  );
}
