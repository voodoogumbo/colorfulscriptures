-- Colorful Scriptures Database Schema
-- This file contains the complete database setup for Supabase

-- Create the main scriptures table
CREATE TABLE scriptures (
  id BIGSERIAL PRIMARY KEY,
  volume_title TEXT NOT NULL,
  book_title TEXT NOT NULL, 
  book_short_title TEXT,
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  verse_title TEXT,
  verse_short_title TEXT,
  scripture_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for optimal query performance
CREATE INDEX idx_scriptures_reference ON scriptures(book_title, chapter_number, verse_number);
CREATE INDEX idx_scriptures_volume ON scriptures(volume_title);
CREATE INDEX idx_scriptures_book ON scriptures(book_title);
CREATE INDEX idx_scriptures_text_search ON scriptures USING gin(to_tsvector('english', scripture_text));

-- Enable Row Level Security (RLS) for public access
ALTER TABLE scriptures ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to scriptures
-- This allows the application to read scripture data without authentication
CREATE POLICY "Allow public read access to scriptures" ON scriptures
    FOR SELECT USING (true);

-- Create policy to allow insert operations (for data import)
-- You may want to restrict this after initial setup
CREATE POLICY "Allow insert for scripture import" ON scriptures
    FOR INSERT WITH CHECK (true);

-- Add some helpful comments
COMMENT ON TABLE scriptures IS 'Contains the complete LDS standard works scripture text';
COMMENT ON COLUMN scriptures.volume_title IS 'Scripture volume (e.g., Old Testament, Book of Mormon)';
COMMENT ON COLUMN scriptures.book_title IS 'Full book name (e.g., 1 Nephi, Genesis)';
COMMENT ON COLUMN scriptures.book_short_title IS 'Abbreviated book name';
COMMENT ON COLUMN scriptures.reference IS 'Human-readable reference (e.g., "1 Nephi 3:7")';
COMMENT ON COLUMN scriptures.scripture_text IS 'The actual verse text';

-- Example query to verify setup:
-- SELECT volume_title, book_title, chapter_number, verse_number, reference, scripture_text 
-- FROM scriptures 
-- WHERE book_title = '1 Nephi' AND chapter_number = 3 AND verse_number = 7;