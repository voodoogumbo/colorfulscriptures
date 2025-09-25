import { NextRequest, NextResponse } from 'next/server';

import {
  createSupabaseServerClient,
  resolveSupabaseConfig,
} from '@/lib/supabaseConfig';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const verse = searchParams.get('verse');

  if (!book || !chapter || !verse) {
    return NextResponse.json(
      { error: 'Missing book, chapter, or verse query parameter.' },
      { status: 400 }
    );
  }

  const chapterNum = Number.parseInt(chapter, 10);
  const verseNum = Number.parseInt(verse, 10);

  if (!Number.isFinite(chapterNum) || !Number.isFinite(verseNum)) {
    return NextResponse.json(
      { error: 'Chapter and verse must be valid numbers.' },
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
      .select('scripture_text')
      .eq('book_title', book)
      .eq('chapter_number', chapterNum)
      .eq('verse_number', verseNum)
      .limit(1)
      .single();

    if (error) {
      console.error('scripture-text: Supabase query error', error);
      return NextResponse.json(
        { error: 'Unable to retrieve scripture text.' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Scripture verse not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ scriptureText: data.scripture_text });
  } catch (err) {
    console.error('scripture-text: Unexpected error', err);
    return NextResponse.json(
      { error: 'Unexpected error retrieving scripture text.' },
      { status: 500 }
    );
  }
}
