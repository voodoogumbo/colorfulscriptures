// app/api/analyze-scripture/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js'; // Import Supabase

// --- Type Definitions ---

// UPDATED: Define expected request body from frontend
interface AnalyzeRequestBody {
    // volume?: string; // Optional: Include if needed for disambiguation in query
    book: string;       // Expect the exact book_title matching the DB
    chapter: number;
    verse: number;
    colorScheme: Array<{ label: string; meaning: string }>;
}

// Define the structure expected *within* the Gemini response JSON
interface GeminiAnalysisResult {
    colorLabel: string;
    colorMeaning: string;
    justification: string;
}

// Define the overall structure Gemini should return
interface GeminiResponseJson {
    scriptureText?: string; // Gemini can echo the analyzed text
    analysis: GeminiAnalysisResult[];
    primaryThemeReasoning?: string;
    error?: string;
}

// --- Supabase Client Initialization ---
// Ensure these are in your .env.local
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Use Service Role Key for backend access

if (!supabaseUrl || !supabaseKey) {
    console.error("API Route: Missing Supabase URL or Service Key in environment variables.");
    // We can't proceed without Supabase config, but throwing here might crash the server start.
    // The check within POST is more appropriate for runtime.
}

// Create the client once - safe for serverless environments
const supabase = createClient(supabaseUrl!, supabaseKey!);

// --- The API Route Handler ---

export async function POST(req: NextRequest) {
    console.log("API Route: Received request");

    // 1. Check Supabase and API Key Config
    if (!supabaseUrl || !supabaseKey) {
         console.error("API Route: Supabase URL or Service Key is not configured.");
         return NextResponse.json({ error: 'Database connection is not configured.' }, { status: 500 });
    }
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("API Route: GOOGLE_API_KEY not found.");
        return NextResponse.json({ error: 'AI API key not configured.' }, { status: 500 });
    }

    // 2. Parse Request Body
    let requestBody: AnalyzeRequestBody;
    try {
        requestBody = await req.json();
         console.log("API Route: Parsed request body:", {
             book: requestBody.book, chapter: requestBody.chapter, verse: requestBody.verse
         }); // Log received ref
    } catch (error) {
        console.error("API Route: Error parsing request body:", error);
        return NextResponse.json({ error: 'Invalid request body. Expected JSON.' }, { status: 400 });
    }

    // 3. Validate Input
    const { book, chapter, verse, colorScheme } = requestBody;
    if (!book || typeof chapter !== 'number' || typeof verse !== 'number' || !colorScheme) {
         return NextResponse.json({ error: 'Missing or invalid book, chapter, verse, or colorScheme.' }, { status: 400 });
    }
     if (!Array.isArray(colorScheme) || colorScheme.length === 0) {
        return NextResponse.json({ error: 'Missing or invalid colorScheme array.' }, { status: 400 });
    }

    let fetchedScriptureText: string | null = null;

    // **** 4. Query Supabase for the scripture text ****
    try {
        console.log(`Querying Supabase for: ${book} ${chapter}:${verse}`);
        const { data: verseData, error: dbError } = await supabase
            .from('scriptures') // Your table name
            .select('scripture_text')
            .eq('book_title', book) // Assumes 'book' matches 'book_title' exactly
            .eq('chapter_number', chapter)
            .eq('verse_number', verse)
            .limit(1)
            .single(); // Returns one object { scripture_text: '...' } or null

        if (dbError) {
            // Handle potential errors, e.g., RLS blocking access if policy wasn't set right
            console.error("Supabase query error:", dbError);
            // Don't expose detailed DB errors to client
            throw new Error(`Could not retrieve scripture from database.`);
        }

        if (!verseData) {
            console.warn(`Verse not found in DB: ${book} ${chapter}:${verse}`);
            return NextResponse.json({ error: 'Scripture verse not found in database.' }, { status: 404 });
        }

        fetchedScriptureText = verseData.scripture_text;
        console.log("Supabase: Successfully fetched scripture text.");

    } catch (dbQueryError: any) {
         console.error("Error querying database:", dbQueryError);
         // Return a generic server error
         return NextResponse.json({ error: `Failed to retrieve scripture text.` }, { status: 500 });
    }
    // **** END: Supabase Query ****


    // 5. Initialize Google AI Client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        // Using the specific preview model requested by user
        model: "gemini-2.5-flash-preview-04-17", // Corrected model name format (check if valid in SDK)
        // NOTE: Ensure your SDK version supports this preview model. Otherwise use a stable one like "gemini-1.5-flash-latest".
        // safetySettings: [ ... ],
    });

    // 6. --- Craft the Prompt for Gemini (using FETCHED text) ---
    const colorSchemeString = colorScheme.map(item => `- ${item.label}: ${item.meaning}`).join('\n');

    // Prompt remains the same as the previous version that analyzes provided text
    const prompt = `
    You are an expert scripture analyzer specializing in identifying theological themes and concepts.

    Your task is to analyze the following provided scripture text according to the user's custom color scheme.

    Provided Scripture Text:
    ---
    ${fetchedScriptureText}
    ---

    User's Color Scheme:
    ${colorSchemeString}

    Based *only* on the provided scripture text and its themes/concepts, suggest the most relevant color(s) from the user-provided color scheme. For each suggested color, provide a justification explaining *why* that color's meaning applies to the provided scripture text. Also, provide a brief summary of the primary theme or message of the provided text.

    Desired Output Format:
    Return *only* a single, valid JSON object matching this *exact* structure. Do not include any text outside of the JSON object, including markdown fences like \`\`\`json.

    {
      "scriptureText": ${JSON.stringify(fetchedScriptureText)},
      "analysis": [
        {
          "colorLabel": "The label of the *most relevant* color from the user's scheme (e.g., 'Pink')",
          "colorMeaning": "The meaning associated with that label in the user's scheme (e.g., 'Grace, Salvation, Love, Compassion, Repentance')",
          "justification": "Your detailed explanation of why this color/meaning fits the provided scripture text."
        }
      ],
      "primaryThemeReasoning": "A concise summary (1-2 sentences) of the main theme or message identified in the provided scripture text, or null if no single primary theme stands out."
    }

    Analyze the provided text according to these instructions and the color scheme. Ensure the output is strictly the JSON object described.
    `;
    // --------------------------------------

    console.log("API Route: Sending prompt to Gemini...");

    // 7. Call Gemini API
    try {
        const result = await model.generateContent(prompt); // No generationConfig needed here
        const response = result.response;
        const responseText = response.text();
        console.log("API Route: Received response text from Gemini.");

        // 8. Parse Gemini Response (with cleaning)
        let geminiJson: GeminiResponseJson;
        try {
             const cleanedText = responseText
                .replace(/^```json\s*/, '')
                .replace(/\s*```$/, '')
                .trim();
             geminiJson = JSON.parse(cleanedText);
             console.log("API Route: Successfully parsed Gemini JSON response.");

        } catch (parseError) {
            console.error("API Route: Failed to parse Gemini response as JSON:", parseError);
            console.error("API Route: Raw Gemini response was:", responseText);
             if (responseText.toLowerCase().includes("error") || responseText.toLowerCase().includes("denied")) {
                 return NextResponse.json({ error: `Gemini API Error: ${responseText}` }, { status: 502 });
             }
             return NextResponse.json({ error: 'Failed to process the analysis response. Invalid JSON format.' }, { status: 502 });
        }

        // 9. Validate Parsed Structure (Basic check)
        if (!geminiJson || !Array.isArray(geminiJson.analysis)) {
             console.error("API Route: Parsed Gemini JSON lacks the required 'analysis' array structure.");
             console.error("API Route: Received structure:", JSON.stringify(geminiJson));
             return NextResponse.json({ error: 'Invalid analysis structure received from AI model.' }, { status: 502 });
         }

         // Ensure the correct scripture text is in the final response
         // Gemini might echo it, but let's guarantee it uses the one we fetched.
         geminiJson.scriptureText = fetchedScriptureText ?? '';


         // 10. Send Success Response to Frontend
         return NextResponse.json(geminiJson, { status: 200 });

    } catch (error: any) { // Catch errors from Gemini API call or subsequent processing
        console.error("API Route: Error calling Gemini API or processing response:", error);
        let errorMessage = error.message || 'An unknown error occurred while communicating with the AI model.';
        // Add more details if it's a GoogleGenerativeAIError
        if (error.name === 'GoogleGenerativeAIError') {
             errorMessage += ` (Details: ${JSON.stringify(error.errorDetails || error)})`;
        }
        return NextResponse.json({ error: `Gemini API interaction failed: ${errorMessage}` }, { status: 500 });
    }
}