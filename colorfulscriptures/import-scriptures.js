import 'dotenv/config';
import fs from 'fs/promises';

import { createClient } from '@supabase/supabase-js';

// Get scripture data file path from command line argument or use default
const scriptureDataPath = process.argv[2] || './data/lds-scriptures.json';

// Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use the SERVICE_ROLE_KEY for server-side operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or API key not found in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importScriptures() {
  console.warn(`Looking for scripture data at: ${scriptureDataPath}`);

  let jsonData = null;
  try {
    jsonData = await fs.readFile(scriptureDataPath, 'utf-8');
    console.warn(
      'Successfully read JSON file. First 50 characters:',
      jsonData.substring(0, 50)
    );
  } catch (readError) {
    console.error(
      `Error reading JSON file at ${scriptureDataPath}:`,
      readError.message
    );
    console.error(
      'Please ensure the scripture data file exists at the specified path.'
    );
    console.error('Usage: node import-scriptures.js [path-to-scripture-json]');
    console.error('Default path: ./data/lds-scriptures.json');
    return; // Stop execution if file reading fails
  }

  let scriptures = null;
  try {
    scriptures = JSON.parse(jsonData);
    if (!Array.isArray(scriptures)) {
      console.error('The JSON file does not contain an array of scriptures.');
      return; // Stop execution if not an array
    }
    console.warn(
      'Successfully parsed JSON. Number of entries:',
      scriptures.length
    );
  } catch (parseError) {
    console.error('Error parsing JSON file:', parseError);
    console.error(
      'Raw JSON data (if available):',
      jsonData ? jsonData.substring(0, 200) + '...' : 'No JSON data read.'
    );
    return; // Stop execution if JSON parsing fails
  }

  try {
    const dataToInsert = scriptures.map(scripture => ({
      volume_title: scripture.volume_title,
      book_title: scripture.book_title,
      book_short_title: scripture.book_short_title,
      chapter_number: scripture.chapter_number,
      verse_number: scripture.verse_number,
      verse_title: scripture.verse_title,
      verse_short_title: scripture.verse_short_title,
      scripture_text: scripture.scripture_text,
      reference: `${scripture.book_title} ${scripture.chapter_number}:${scripture.verse_number}`, // Create a unique reference
    }));

    const { data, error } = await supabase
      .from('scriptures') // Replace 'scriptures' with your table name
      .insert(dataToInsert);

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.warn(`Successfully inserted ${data.length} scriptures.`);
    }
  } catch (insertError) {
    console.error('Error during Supabase insertion:', insertError);
  }
}

importScriptures();
