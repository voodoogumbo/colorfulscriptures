// app/api/analyze-scripture/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

import {
  createSupabaseServerClient,
  resolveSupabaseConfig,
} from '@/lib/supabaseConfig';

// --- Type Definitions ---

// UPDATED: Define expected request body from frontend
interface AnalyzeRequestBody {
  // volume?: string; // Optional: Include if needed for disambiguation in query
  book: string; // Expect the exact book_title matching the DB
  chapter: number;
  verse: number;
  colorScheme: Array<{ label: string; meaning: string }>;
}

// Define the structure expected *within* the Gemini response JSON
interface GeminiAnalysisResult {
  colorLabel: string;
  colorMeaning: string;
  justification: string;
  confidence: number;
}

// Define the overall structure Gemini should return
interface GeminiResponseJson {
  scriptureText?: string; // Gemini can echo the analyzed text
  analysis: GeminiAnalysisResult[];
  primaryThemeReasoning?: string;
  error?: string;
}

// --- Supabase Client Helpers ---
// --- The API Route Handler ---

export async function POST(req: NextRequest) {
  // 1. Check Supabase and API Key Config
  const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Database connection is not configured.' },
      { status: 500 }
    );
  }
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('API Route: GOOGLE_API_KEY not found.');
    return NextResponse.json(
      { error: 'AI API key not configured.' },
      { status: 500 }
    );
  }

  // 2. Parse Request Body
  let requestBody: AnalyzeRequestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    console.error('API Route: Error parsing request body:', error);
    return NextResponse.json(
      { error: 'Invalid request body. Expected JSON.' },
      { status: 400 }
    );
  }

  // 3. Validate Input
  const { book, chapter, verse, colorScheme } = requestBody;
  if (
    !book ||
    typeof chapter !== 'number' ||
    typeof verse !== 'number' ||
    !colorScheme
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid book, chapter, verse, or colorScheme.' },
      { status: 400 }
    );
  }
  if (!Array.isArray(colorScheme) || colorScheme.length === 0) {
    return NextResponse.json(
      { error: 'Missing or invalid colorScheme array.' },
      { status: 400 }
    );
  }

  let fetchedScriptureText: string | null = null;

  // **** 4. Query Supabase for the scripture text ****
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Database connection is not configured.');
    }
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
      console.error('Supabase query error:', dbError);
      // Don't expose detailed DB errors to client
      throw new Error(`Could not retrieve scripture from database.`);
    }

    if (!verseData) {
      console.warn(`Verse not found in DB: ${book} ${chapter}:${verse}`);
      return NextResponse.json(
        { error: 'Scripture verse not found in database.' },
        { status: 404 }
      );
    }

    fetchedScriptureText = verseData.scripture_text;
  } catch (dbQueryError: unknown) {
    console.error('Error querying database:', dbQueryError);
    // Return a generic server error
    return NextResponse.json(
      { error: `Failed to retrieve scripture text.` },
      { status: 500 }
    );
  }
  // **** END: Supabase Query ****

  // 5. Initialize Google AI Client
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    // safetySettings: [ ... ],
  });

  // 6. --- Craft the Prompt for Gemini (using FETCHED text) ---
  const colorSchemeString = colorScheme
    .map(item => `- ${item.label}: ${item.meaning}`)
    .join('\n');

  // Prompt remains the same as the previous version that analyzes provided text
  const prompt = `
    You are an expert scripture analyst. Base every decision *only* on the provided scripture text and the meanings supplied in the user's color scheme.

    Provided Scripture Text:
    ---
    ${fetchedScriptureText}
    ---

    User's Color Scheme:
    ${colorSchemeString}

    Instructions:
    - Identify the single best highlight color for the entire verse that most completely captures the message.
    - Also identify the runner-up color (second best fit). You must always return two colors (top choice first).
    - Assign each color a confidence value from 0-100 (integers) that reflects how strongly the verse should be highlighted with that color. The confidences must sum to 100.
    - If no meaningful runner-up exists, set the second confidence to 0 but still explain why it is far less likely.
    - Provide a concise justification for each color that references details from the verse.
    - Provide a short summary of the primary theme (or null when no clear theme exists).

    Desired Output Format:
    Return only one valid JSON object in exactly this structure (no extra text or markdown fences). Order the analysis array from highest to lowest confidence.

    {
      "scriptureText": ${JSON.stringify(fetchedScriptureText)},
      "analysis": [
        {
          "colorLabel": "Most relevant color label",
          "colorMeaning": "Meaning from the user scheme",
          "confidence": 0,
          "justification": "Explain why the entire verse fits this color."
        }
      ],
      "primaryThemeReasoning": "One-to-two sentence primary theme summary, or null."
    }

    Analyze the scripture according to these rules and return only the JSON object above.
    `;
  // --------------------------------------

  // 7. Call Gemini API
  try {
    const result = await model.generateContent(prompt); // No generationConfig needed here
    const response = result.response;
    const responseText = response.text();

    // 8. Parse Gemini Response (with cleaning)
    let geminiJson: GeminiResponseJson;
    try {
      const cleanedText = responseText
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();
      geminiJson = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        'API Route: Failed to parse Gemini response as JSON:',
        parseError
      );
      console.error('API Route: Raw Gemini response was:', responseText);
      if (
        responseText.toLowerCase().includes('error') ||
        responseText.toLowerCase().includes('denied')
      ) {
        return NextResponse.json(
          { error: `Gemini API Error: ${responseText}` },
          { status: 502 }
        );
      }
      return NextResponse.json(
        {
          error:
            'Failed to process the analysis response. Invalid JSON format.',
        },
        { status: 502 }
      );
    }

    // 9. Validate Parsed Structure (Basic check)
    if (!geminiJson || !Array.isArray(geminiJson.analysis)) {
      console.error(
        "API Route: Parsed Gemini JSON lacks the required 'analysis' array structure."
      );
      console.error(
        'API Route: Received structure:',
        JSON.stringify(geminiJson)
      );
      return NextResponse.json(
        { error: 'Invalid analysis structure received from AI model.' },
        { status: 502 }
      );
    }

    // Ensure the correct scripture text is in the final response
    // Gemini might echo it, but let's guarantee it uses the one we fetched.
    geminiJson.scriptureText = fetchedScriptureText ?? '';

    // 10. Send Success Response to Frontend
    return NextResponse.json(geminiJson, { status: 200 });
  } catch (error: unknown) {
    // Catch errors from Gemini API call or subsequent processing
    console.error(
      'API Route: Error calling Gemini API or processing response:',
      error
    );
    let errorMessage =
      'An unknown error occurred while communicating with the AI model.';

    if (error instanceof Error) {
      errorMessage = error.message;
      // Add more details if it's a GoogleGenerativeAIError
      if (error.name === 'GoogleGenerativeAIError') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorDetails = (error as any).errorDetails; // Google AI specific error property
        errorMessage += ` (Details: ${JSON.stringify(errorDetails || error)})`;
      }
    }
    return NextResponse.json(
      { error: `Gemini API interaction failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
