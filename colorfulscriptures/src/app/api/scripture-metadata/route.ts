import { NextRequest, NextResponse } from 'next/server';

import {
  createSupabaseServerClient,
  resolveSupabaseConfig,
} from '@/lib/supabaseConfig';

interface ChapterVerseMetadata {
  chapters: number[];
  versesByChapter: Record<number, number>;
}

function buildChapterVerseMetadata(
  rows: Array<{ chapter_number: number; verse_number: number }>
): ChapterVerseMetadata {
  const versesByChapter = new Map<number, number>();

  for (const row of rows) {
    const currentMax = versesByChapter.get(row.chapter_number) ?? 0;
    if (row.verse_number > currentMax) {
      versesByChapter.set(row.chapter_number, row.verse_number);
    }
  }

  const chapters = Array.from(versesByChapter.keys()).sort((a, b) => a - b);
  const record: Record<number, number> = {};
  for (const [chapterNumber, verseCount] of versesByChapter.entries()) {
    record[chapterNumber] = verseCount;
  }

  return { chapters, versesByChapter: record };
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const book = searchParams.get('book');

  if (!book) {
    return NextResponse.json(
      { error: 'Missing book query parameter.' },
      { status: 400 }
    );
  }

  const { url, key } = resolveSupabaseConfig();
  if (!url || !key) {
    return NextResponse.json(
      { error: 'Database connection is not configured.' },
      { status: 500 }
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database connection is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('scriptures')
      .select('chapter_number, verse_number')
      .eq('book_title', book);

    if (error) {
      console.error('scripture-metadata: Supabase query error', error);
      return NextResponse.json(
        { error: 'Unable to retrieve scripture metadata.' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No chapters found for the provided book.' },
        { status: 404 }
      );
    }

    const metadata = buildChapterVerseMetadata(data);
    return NextResponse.json(metadata);
  } catch (err) {
    console.error('scripture-metadata: Unexpected error', err);
    return NextResponse.json(
      { error: 'Unexpected error retrieving scripture metadata.' },
      { status: 500 }
    );
  }
}
