/**
 * One-time script to generate static scripture metadata JSON.
 * Queries Supabase for all books' chapter/verse counts and writes
 * the result to src/lib/scripture_metadata.json.
 *
 * Usage: node scripts/generate-metadata.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Volume → book ordering (canonical order)
const VOLUMES = {
  "Old Testament": [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
    "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles",
    "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes",
    "Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel",
    "Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk",
    "Zephaniah","Haggai","Zechariah","Malachi"
  ],
  "New Testament": [
    "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
    "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians",
    "2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
    "James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
  ],
  "Book of Mormon": [
    "1 Nephi","2 Nephi","Jacob","Enos","Jarom","Omni","Words of Mormon",
    "Mosiah","Alma","Helaman","3 Nephi","4 Nephi","Mormon","Ether","Moroni"
  ],
  "Doctrine and Covenants": ["Doctrine and Covenants"],
  "Pearl of Great Price": [
    "Moses","Abraham","Joseph Smith--Matthew","Joseph Smith--History","Articles of Faith"
  ]
};

async function fetchAllMetadata() {
  const allBooks = Object.values(VOLUMES).flat();
  const versesByChapter = {};

  console.log(`Fetching metadata for ${allBooks.length} books...`);

  for (const book of allBooks) {
    // Fetch chapter_number and verse_number for this book
    const { data, error } = await supabase
      .from('scriptures')
      .select('chapter_number, verse_number')
      .eq('book_title', book);

    if (error) {
      console.error(`Error fetching ${book}:`, error.message);
      continue;
    }

    if (!data || data.length === 0) {
      console.warn(`No data found for: ${book}`);
      continue;
    }

    // Build max verse per chapter
    const chapterMap = {};
    for (const row of data) {
      const ch = String(row.chapter_number);
      const v = row.verse_number;
      if (!chapterMap[ch] || v > chapterMap[ch]) {
        chapterMap[ch] = v;
      }
    }

    // Sort chapters numerically
    const sorted = {};
    const chapterNumbers = Object.keys(chapterMap).sort((a, b) => Number(a) - Number(b));
    for (const ch of chapterNumbers) {
      sorted[ch] = chapterMap[ch];
    }

    versesByChapter[book] = sorted;
    console.log(`  ${book}: ${chapterNumbers.length} chapters, ${data.length} verses`);
  }

  return versesByChapter;
}

async function main() {
  const versesByChapter = await fetchAllMetadata();

  // Build volumes object (just book lists, for backward compat)
  const volumes = {};
  for (const [vol, books] of Object.entries(VOLUMES)) {
    volumes[vol] = books;
  }

  const output = {
    volumes,
    versesByChapter,
  };

  const outPath = resolve(__dirname, '../src/lib/scripture_metadata.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
  console.log(`\nWrote metadata to ${outPath}`);
  console.log(`Books with data: ${Object.keys(versesByChapter).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
