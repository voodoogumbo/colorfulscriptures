import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

// Replace with your Supabase URL and API key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use the SERVICE_ROLE_KEY for server-side operations

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or API key not found in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importScriptures() {
    let jsonData = null;
    try {
        jsonData = await fs.readFile('/Users/williamg/Downloads/lds-scriptures.json', 'utf-8');
        console.log('Successfully read JSON file. First 50 characters:', jsonData.substring(0, 50));
    } catch (readError) {
        console.error('Error reading JSON file:', readError);
        return; // Stop execution if file reading fails
    }

    let scriptures = null;
    try {
        scriptures = JSON.parse(jsonData);
        if (!Array.isArray(scriptures)) {
            console.error('The JSON file does not contain an array of scriptures.');
            return; // Stop execution if not an array
        }
        console.log('Successfully parsed JSON. Number of entries:', scriptures.length);
    } catch (parseError) {
        console.error('Error parsing JSON file:', parseError);
        console.error('Raw JSON data (if available):', jsonData ? jsonData.substring(0, 200) + '...' : 'No JSON data read.');
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
            console.log(`Successfully inserted ${data.length} scriptures.`);
        }

    } catch (insertError) {
        console.error('Error during Supabase insertion:', insertError);
    }
}

importScriptures();