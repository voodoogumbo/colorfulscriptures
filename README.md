# Colorful Scriptures 🎨📖

An AI-powered scripture study tool designed specifically for **LDS (Latter-Day Saints) scriptures** that provides intelligent color-coding suggestions based on theological themes and concepts.

![Scripture Analysis Example](docs/screenshot.png)

## Overview

Colorful Scriptures helps LDS members enhance their scripture study by analyzing verses from the standard works and suggesting meaningful colors for highlighting based on theological themes. Using Google's Gemini AI, it identifies concepts like prayer, salvation, wisdom, and growth, then recommends appropriate colors for visual scripture marking.

## Features

### 🎯 **Intelligent Scripture Analysis**
- AI-powered analysis using Google Gemini 2.5 Flash
- Identifies theological themes and concepts in scripture text
- Provides detailed justifications for color suggestions

### 📚 **Complete LDS Scripture Database**
- **Old Testament** (39 books)
- **New Testament** (27 books) 
- **Book of Mormon** (15 books)
- **Doctrine and Covenants**
- **Pearl of Great Price** (5 books)

### 🎨 **Customizable Color Scheme**
- 12 predefined colors with theological meanings
- Default scheme includes:
  - **Purple**: Prayer, Praise, Blessing, Worship
  - **Yellow**: God, Jesus, Holy Spirit  
  - **Blue**: Wisdom, Teaching, Instruction
  - **Green**: Growth, New Life, Faith
  - **Red**: Evil, Sin, Temptation, Death
  - **Pink**: Grace, Salvation, Love, Compassion, Repentance
  - **Orange**: Laws, History, Genealogies, Numbers

### 💻 **Modern Web Interface**
- Responsive design for desktop and mobile
- Dark mode support
- Intuitive dropdowns for scripture selection
- Real-time analysis results

## Tech Stack

- **Frontend**: Next.js 15.3.1, React 19, TypeScript 5
- **Styling**: TailwindCSS v4 with PostCSS integration
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Generative AI (Gemini 2.5 Flash)
- **Code Quality**: ESLint 9 with Next.js config, Prettier 3.6
- **Git Hooks**: Husky 9.1 with pre-commit linting
- **Development**: Turbopack for fast dev builds
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- [Google AI API key](https://aistudio.google.com/app/apikey) (free tier available)
- [Supabase account](https://supabase.com) (free tier available)

## Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/voodoogumbo/colorfulscriptures.git
cd colorfulscriptures/colorfulscriptures
npm install
```

### 2. Set up Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_API_KEY=your_google_ai_api_key
```

### 3. Set up Supabase Database
1. Create a new Supabase project
2. Run the database schema:
```sql
-- See colorfulscriptures/docs/database-schema.sql for complete setup
```

### 4. Import Scripture Data
```bash
npm run import-scriptures
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start analyzing scriptures!

## Detailed Setup Guide

### Getting API Keys

#### Google AI API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env.local` file

#### Supabase Setup
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API to find your keys and URL
4. Copy Project URL and both keys to `.env.local`

### Database Schema

The application requires a `scriptures` table with the following structure:

```sql
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

-- Add indexes for performance
CREATE INDEX idx_scriptures_reference ON scriptures(book_title, chapter_number, verse_number);
CREATE INDEX idx_scriptures_volume ON scriptures(volume_title);
```

### Scripture Data Import

The included scripture data (`colorfulscriptures/data/lds-scriptures.json`) contains the complete LDS standard works. To import:

```bash
npm run import-scriptures
```

This will populate your Supabase database with approximately 41,000 verses.

## Usage

1. **Configure Your Color Scheme** - Adjust the color meanings to match your study focus
2. **Select Scripture Reference** - Choose volume, book, chapter, and verse
3. **Analyze** - Click "Color Scriptures!" to get AI analysis
4. **Review Results** - See color suggestions with theological justifications

## Code Quality & Development

### Code Formatting and Linting

This project uses a comprehensive code quality setup:

- **ESLint**: Configured with Next.js, TypeScript, and React rules
- **Prettier**: Enforces consistent code formatting
- **Husky**: Runs quality checks before commits
- **Git Hooks**: Pre-commit hooks run linting and formatting checks

### Development Workflow

1. **Install dependencies**: `npm install`
2. **Set up git hooks**: `npm run prepare` (runs automatically after install)
3. **Start development**: `npm run dev`
4. **Before committing**: Husky automatically runs `npm run lint` and `npm run format:check`

### Code Standards

- All code is automatically formatted with Prettier
- ESLint enforces TypeScript best practices and React patterns
- Import statements are automatically organized alphabetically
- Unused variables and explicit `any` types are flagged as errors
- Console statements (except error/warn) generate warnings

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js config
- `npm run lint:fix` - Run ESLint and auto-fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run import-scriptures` - Import scripture data to database
- `npm run prepare` - Set up Husky git hooks

### Project Structure

```
colorfulscriptures/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main scripture analysis interface
│   │   ├── layout.tsx            # App layout and metadata
│   │   ├── globals.css           # Global styles and theme
│   │   └── api/
│   │       └── analyze-scripture/
│   │           └── route.ts      # API endpoint for AI analysis
│   └── lib/
│       └── scripture_metadata.json # Scripture book/volume mapping
├── data/
│   ├── README.md                 # Scripture data documentation
│   └── sample-scriptures.json    # Sample data for testing
├── docs/
│   ├── SETUP.md                  # Detailed setup instructions
│   └── SCREENSHOT_GUIDE.md       # Guide for adding screenshots
├── .husky/                       # Git hooks configuration
│   └── pre-commit               # Pre-commit quality checks
├── .prettierrc.json             # Prettier configuration
├── .prettierignore              # Prettier ignore patterns
├── eslint.config.js             # ESLint configuration (flat config)
├── next.config.ts               # Next.js configuration
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
├── import-scriptures.js         # Database import utility
└── package.json
```

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install` (sets up git hooks automatically)
4. **Make your changes**: Follow the established code patterns and conventions
5. **Test your changes**: Ensure the application works correctly
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
   - Pre-commit hooks will automatically run linting and formatting checks
   - Fix any issues before the commit will succeed
7. **Push to your branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices (no `any` types, handle undefined cases)
- Use meaningful variable and function names
- Write clear commit messages
- Ensure all linting and formatting checks pass
- Test changes locally before submitting PRs

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **Scripture Text**: LDS standard works are used under public domain
- **AI Analysis**: Powered by Google's Gemini AI
- **Database**: Hosted on Supabase
- **Framework**: Built with Next.js and React

## Support

For questions or issues, please [open an issue](https://github.com/voodoogumbo/colorfulscriptures/issues) on GitHub.

---

*Built with ❤️ for LDS scripture study and spiritual growth*