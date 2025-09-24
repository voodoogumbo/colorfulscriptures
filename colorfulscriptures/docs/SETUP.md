# Colorful Scriptures Setup Guide

This guide will walk you through setting up Colorful Scriptures on your local machine.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Google AI API Key** - Free at [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Supabase Account** - Free at [supabase.com](https://supabase.com)

## Step 1: Clone and Install

```bash
git clone https://github.com/voodoogumbo/colorfulscriptures.git
cd colorfulscriptures/colorfulscriptures
npm install
```

**Note**: The `npm install` command will automatically set up git hooks via Husky for code quality checks.

## Step 2: Get Your API Keys

### Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the generated key

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be fully provisioned (2-3 minutes)
4. Go to **Settings** → **API** in your project dashboard
5. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role/secret key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GOOGLE_API_KEY=your_google_ai_key_here
```

## Step 4: Set Up Database

1. In your Supabase project, go to the **SQL Editor**
2. Copy the contents of `docs/database-schema.sql`
3. Paste and run the SQL in the editor
4. Verify the `scriptures` table was created

## Step 5: Import Scripture Data

### Option A: Use Sample Data (for testing)

```bash
npm run import-scriptures data/sample-scriptures.json
```

### Option B: Get Full Scripture Data

1. Obtain LDS scripture data in the correct JSON format (see `data/README.md`)
2. Place the file at `data/lds-scriptures.json`
3. Import the data:

```bash
npm run import-scriptures
```

## Step 6: Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test the Application

1. Select a scripture reference from the dropdowns
2. Click "Color Scriptures!"
3. Verify you get AI analysis results

## Troubleshooting

### "Database connection is not configured" Error

- Check that your Supabase environment variables are correct
- Ensure your Supabase project is fully provisioned

### "AI API key not configured" Error

- Verify your Google AI API key is correct in `.env.local`
- Ensure you've enabled the Gemini API in Google AI Studio

### "Scripture verse not found" Error

- Make sure you've imported scripture data
- Verify the verse exists in your database by checking the Supabase table editor

### Import Script Errors

- Check that your JSON file is valid and in the correct format
- Ensure you have the `SUPABASE_SERVICE_ROLE_KEY` (not just the anon key)
- Verify file path is correct

## Next Steps

Once everything is working:

1. **Customize Colors**: Adjust the color scheme meanings to match your study focus
2. **Import Full Data**: If using sample data, import the complete scripture collection
3. **Deploy**: Consider deploying to Vercel for public access

## Development Commands

For ongoing development work:

```bash
# Start development server with hot reload
npm run dev

# Check code formatting
npm run format:check

# Format all code
npm run format

# Run linting checks
npm run lint

# Fix auto-fixable linting issues
npm run lint:fix

# Build for production
npm run build
```

## Code Quality

The project uses automated code quality tools:

- **ESLint**: Enforces coding standards and catches potential issues
- **Prettier**: Maintains consistent code formatting
- **Husky**: Runs quality checks before each commit
- **TypeScript**: Provides type safety and better development experience

All quality checks run automatically when you commit code, ensuring consistency across the codebase.

## Getting Help

- Check the main [README.md](../README.md) for additional information
- Review the [database schema](database-schema.sql) if you have database issues
- Open an issue on GitHub if you encounter problems

## Security Note

Never commit your `.env.local` file to version control. It contains sensitive API keys.
