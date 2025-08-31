# Scripture Data

This directory should contain the LDS scripture data in JSON format.

## Required File

Place your scripture data file here as `lds-scriptures.json`. The expected format is:

```json
[
  {
    "volume_title": "Book of Mormon",
    "book_title": "1 Nephi", 
    "book_short_title": "1 Ne.",
    "chapter_number": 3,
    "verse_number": 7,
    "verse_title": "1 Nephi 3:7",
    "verse_short_title": "1 Ne. 3:7",
    "scripture_text": "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.",
    "reference": "1 Nephi 3:7"
  }
]
```

## Where to Get Scripture Data

### Option 1: LDS Scripture API
You can download scripture data from various LDS scripture APIs or sources that provide the standard works in JSON format.

### Option 2: Manual Export
If you have access to LDS scripture data in another format, ensure it matches the structure above.

### Option 3: Sample Data
Use the provided `sample-scriptures.json` for testing purposes (contains a small subset of verses).

## After Obtaining Data

1. Place the file as `data/lds-scriptures.json`
2. Run the import script: `npm run import-scriptures`
3. The script will import all verses into your Supabase database

## File Size
The complete LDS scripture collection is approximately 2-5 MB in JSON format, containing around 41,000 verses.