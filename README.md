# AI Art Teacher

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-vsxixo4o)

An AI-powered art education app that analyzes uploaded artwork and provides master-level feedback, skill assessment, token rewards, and personalized coaching. Designed for artists of all skill levels, from beginners to masters.

## Features

### Artwork Analysis
- Upload any artwork (digital or traditional) and receive detailed, structured feedback
- AI identifies the medium (watercolor, oil, gouache, charcoal, digital, etc.) and tailors the critique using medium-specific rubrics
- Skill level assessment across five tiers: beginner, intermediate, advanced, professional, master
- Tone and feedback depth adapt to the detected skill level — beginners get encouragement-focused feedback, masters get legacy-level discourse
- Pin-based critique overlay — the AI places numbered pins on specific areas of the artwork with targeted advice for each

### AI-Generated Art Detection
- Pre-analysis screen detects whether the uploaded image is AI-generated
- If AI generation is detected with medium-to-high confidence, the user is informed and a token penalty is applied
- Designed to favor the artist when uncertain

### Follow-Up Conversation
- After receiving feedback, users can ask follow-up questions in a chat interface
- The AI maintains context from the original critique for natural, relevant discussion

### Masterpiece Generation
- Analyzes the style of the user's uploaded artwork and generates a "masterpiece" image in the same style using DALL-E 3
- Style description is produced by the vision AI, then fed to the image generator

### Token Economy & Rewards
- Users earn tokens for each artwork analyzed, with bonuses for:
  - Medium match (using your declared preferred medium)
  - Analog/traditional art detection
  - Experimentation and risk-taking
  - Critique pin engagement
- Streak tracking with milestone bonuses for consecutive uploads
- Token shop for unlocking premium backgrounds and features

### Achievement System
- Streak milestones with celebration animations
- Achievement badges earned through consistent use and skill progression
- Skill-level progression tracking

### Accessibility & Inclusivity
- Neurodivergent learner profile survey that customizes AI feedback tone and structure
- Sensory mode settings (reduced, minimal) to reduce visual stimulation
- Font size and font family options (including dyslexic-friendly font)
- High contrast mode
- Audio narration of feedback
- Step-by-step feedback mode for breaking down critiques into digestible pieces
- Focus mode to minimize distractions

### Seasonal & Cosmetic Features
- Seasonal backgrounds that change with the time of year
- Premium backgrounds unlockable via tokens
- Sticker collection and sticker canvas for creative play
- Sensory check-in mood tracker

### Portfolio
- Cloud-saved portfolio of all analyzed artwork
- Stores image, skill level, tokens earned, feedback, critique pins, and medium metadata
- Gallery view to browse past work and track progression

### Learning Profiles
- Preferred medium selector (watercolor, oil, gouache, charcoal, digital, and more)
- Learning profile survey adjusts AI feedback for neurodivergent learners
- Profile prompt string injected into AI system instructions

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Supabase (Postgres database, Edge Functions, Storage)
- **AI Providers:** Google Gemini (primary) + OpenAI GPT-4o (fallback)
- **Image Generation:** OpenAI DALL-E 3

## AI Model Fallback System

The app uses a comprehensive multi-model fallback chain so that if one AI model is rate-limited or unavailable, it automatically switches to the next. Models are tried in order until one succeeds:

### Vision Tasks (artwork analysis, AI detection, style analysis)
1. **Gemini Flash (latest)** — primary
2. **Gemini 3.5 Flash Lite**
3. **Gemini 3.1 Flash Lite** — generous usage limits
4. **Gemini 2.5 Flash Lite**
5. **Gemini 2.5 Flash TTS**
6. **Gemini 3 Flash**
7. **Gemini 3.1 Flash TTS**
8. **Gemini 3.5 Flash**
9. **Gemini 2.5 Flash**
10. **Gemini 2.0 Flash**
11. **Gemma 4 26B**
12. **Gemma 4 31B**
13. **OpenAI GPT-4o** — final fallback

### Text Tasks (follow-up chat)
The same Gemini/Gemma model chain is tried first, followed by OpenAI GPT-4o as the fallback.

### How It Works
- Each Gemini/Gemma model is called in sequence. If a model returns a 429 (rate limit) or error, the system applies exponential backoff and moves to the next model.
- If all Gemini/Gemma models are exhausted, the request falls through to OpenAI GPT-4o.
- The fallback is transparent to the user — they receive their analysis or chat response without seeing which model produced it.
- If every model in the chain fails, the user sees a friendly "all providers are rate-limited" message and can retry.

## API Keys

The following secrets are configured on the Supabase project:

| Secret | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini/Gemma model access (primary AI) |
| `OPENAI_API_KEY` | OpenAI GPT-4o (fallback AI) + DALL-E 3 image generation |

Both keys are stored as Supabase Edge Function secrets and are automatically available to the deployed function — no manual configuration needed.

## Architecture

```
Browser (React SPA)
  │
  ├── POST /functions/v1/analyze-artwork
  │     ├── mode: (default)     → AI detection → Artwork analysis → JSON response
  │     ├── mode: followup      → Follow-up chat response
  │     ├── mode: analyze-style → Style description for masterpiece generation
  │     └── mode: generate-masterpiece → DALL-E 3 image generation
  │
  ├── Supabase Postgres
  │     ├── Portfolio entries (images, feedback, metadata)
  │     └── User progress data
  │
  └── Supabase Storage
        └── Artwork images
```

The edge function (`supabase/functions/analyze-artwork/index.ts`) handles all AI interactions. It accepts image base64 data and a mode parameter, routes to the appropriate AI workflow, manages the multi-model fallback chain, parses the structured JSON response, and returns it to the frontend.

## Getting Started

This project runs on [Bolt](https://bolt.new). The dev server starts automatically — no manual setup required.

API keys and Supabase credentials are pre-configured in the environment.

## License

This project is for educational use.
