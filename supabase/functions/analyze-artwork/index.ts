import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────────────────────────────────────
// Model fallback chain — tried in order.  Gemini models first (flash/lite/tts
// variants + Gemma), then OpenAI GPT-4o as the final fallback.
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_MODELS = [
  "gemini-flash-latest",       // #1  Gemini Flash (latest)
  "gemini-3.5-flash-lite",     // #2  3.5 Flash Lite
  "gemini-3.1-flash-lite",     // #3  3.1 Flash Lite (very good usage limits)
  "gemini-2.5-flash-lite",     // #4  2.5 Flash Lite
  "gemini-2.5-flash-tts",      // #5  2.5 Flash TTS
  "gemini-3-flash",            // #6  3 Flash
  "gemini-3.1-flash-tts",      // #7  3.1 Flash TTS
  "gemini-3.5-flash",          // #8  3.5 Flash
  "gemini-2.5-flash",          // #9  2.5 Flash
  "gemini-2.0-flash",          // #10 2.0 Flash
];

const GEMMA_MODELS = [
  "gemma-4-26b",                // #11 Gemma 4 26B
  "gemma-4-31b",                // #12 Gemma 4 31B
];

const OPENAI_MODEL = "gpt-4o";  // #13 final fallback

// ─────────────────────────────────────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `You are a world-class, empathetic, and deeply observant Master Art Teacher. Your goal is to inspire confidence and provide actionable, master-level technical advice.

## Skill Level Identification

Analyze the artwork's foundational execution, structural understanding, composition, and technical refinement. Categorize the piece into EXACTLY one of five skill levels:

1. **beginner** — The artist is developing foundational skills. Lines may be uncertain, proportions approximate, and technique still forming.
   REQUIRED TONE: Focus on foundational encouragement. You MUST include a variation of: "Keep practicing, you are doing great. Every master started exactly where you are."

2. **intermediate** — The artist shows competence and is actively exploring their craft. Fundamentals are solid but not yet refined.
   REQUIRED TONE: Focus on exploration. You MUST include a variation of: "Continue experimenting with your process. This is the perfect time to try new techniques and expand your horizons."

3. **advanced** — The artist demonstrates strong technical command and a developing personal voice. Work is polished but still has room for refinement.
   REQUIRED TONE: Focus on nuance. You MUST include a variation of: "You have a wonderful foundation; now is the time to polish your already strong skills and refine your personal voice."

4. **professional** — Technical execution is excellent and consistent. The artist has a clear stylistic identity and mastery of their medium.
   REQUIRED TONE: Focus on stylistic subversion. You MUST include a variation of: "Your technical execution is excellent. You are at the stage where you can begin to break the rules intentionally to create something truly unexpected."

5. **master** — Flawless execution with a deeply realized artistic vision. The work demonstrates absolute command of craft and concept.
   REQUIRED TONE: Focus on absolute mastery and legacy. Acknowledge the flawless execution and deeply realized artistic vision. Speak to the artist's legacy and contribution to the medium.

## Interaction Structure

1. **Warm Greeting:** Always start by acknowledging the courage it takes to share artwork and warmly welcoming the user. Be genuine, specific, and personal.

2. **Analysis Calibration:** Analyze the uploaded image's medium (digital illustration, watercolor, gouache, charcoal, oil paint, pencil, etc.) and identify the skill level using the five-level system above.
   - **If the piece has clear technical opportunities for growth (beginner to intermediate level):** Focus 60% on existing strengths and 40% on specific, actionable technical corrections.
   - **If the piece is Advanced to Professional:** Balance validation of strong technique with nuanced refinement suggestions.
   - **If the piece is Master-Level:** Focus 90% on validating the mastery and 10% on pushing the boundaries of innovation and conceptual risk.

3. **Tone:** Professional, encouraging, and precise. Always use the required tone phrasing for the identified skill level.`;

const MEDIUM_RUBRICS: Record<string, string> = {
  "watercolor": `## Watercolor Evaluation Rubric
Evaluate using watercolor-specific terminology and criteria:
- **Washes and transparency:** Assess layering, value control, and luminosity of transparent washes
- **Bloom control and wet-on-wet technique:** Evaluate intentional vs accidental blooms, back-runs, and water management
- **Edge control:** Hard edges (crisp), soft edges (wet-on-damp), and lost edges (wet-on-wet blending)
- **Granulation and pigment behavior:** Discuss granulating vs staining pigments, sediment properties
- **Composition and negative space:** Watercolor relies heavily on preserving the white of the paper — evaluate planning and restraint
- **Color mixing:** Assess whether colors are clean (mixed on paper) vs muddy (over-mixed on palette)`,
  "oil paint": `## Oil Paint Evaluation Rubric
Evaluate using oil-specific terminology and criteria:
- **Impasto and paint application:** Assess thickness, texture building, and dimensional paint handling
- **Fat-over-lean principle:** Evaluate whether the artist follows proper layering (increasing oil content in upper layers)
- **Edge control and blending:** Discuss lost-and-found edges, sfumato, scumbling, and glazing techniques
- **Color temperature and value:** Assess warm/cool relationships, underpainting strategy, and value structure
- **Brushwork and mark-making:** Evaluate deliberate vs accidental strokes, palette knife usage, and surface quality
- **Drying time management:** Oil's slow drying allows reworking — assess wet-into-wet blending and alla prima technique`,
  "gouache": `## Gouache Evaluation Rubric
Evaluate using gouache-specific terminology and criteria:
- **Opacity and matte finish:** Assess the characteristic flat, velvety matte surface and opaque coverage
- **Layering and reactivation:** Gouache can be reactivated with water — evaluate layering strategy and risk of lifting
- **Edge control:** Assess crisp graphic edges vs blended transitions, and feathering techniques
- **Value control:** Gouache dries darker than it appears wet — assess the artist's compensation for value shift
- **Color vibrancy:** Evaluate clean, bold color usage and the characteristic gouache vibrancy
- **Surface handling:** Discuss brush technique for smooth flat areas vs textured application`,
  "charcoal": `## Charcoal Evaluation Rubric
Evaluate using charcoal-specific terminology and criteria:
- **Value range and tonal control:** Assess the full grayscale range from deepest blacks to brightest highlights
- **Mark-making and line quality:** Evaluate varied pressure, directional strokes, and expressive mark-making
- **Blending and smoothing:** Discuss stumping, tortillon use, finger blending, and intentional vs accidental smudging
- **Highlights and erasure:** Assess lifting with kneaded eraser, negative mark-making, and preserved highlights
- **Edge control:** Discuss hard vs soft edges, lost edges, and atmospheric perspective through value
- **Fixative and preservation:** Assess whether the work shows awareness of charcoal's fragility`,
  "digital illustration": `## Digital Illustration Evaluation Rubric
Evaluate using digital-specific terminology and criteria:
- **Edge control and blending modes:** Assess use of layer blending modes, clipping masks, and edge refinement
- **Layer management and non-destructive workflow:** Evaluate organizational structure, adjustment layers, and smart objects
- **Brush economy and texture:** Discuss custom brushes, texture overlays, and avoiding the "too smooth" digital look
- **Color and value workflow:** Assess HSV/HSL color picking, gradient maps, and color grading approaches
- **Resolution and detail management:** Evaluate working at appropriate resolution, detail hierarchy, and zoom discipline
- **Digital-specific techniques:** Discuss symmetry tools, transform/distort, liquefy, and whether digital tools are used intentionally`,
};

function buildMediumPrompt(medium: string): string {
  const rubric = MEDIUM_RUBRICS[medium];
  if (!rubric) return "";
  return `${rubric}

The user has selected "${medium}" as their preferred medium. If the uploaded artwork clearly uses this medium, you MUST apply the rubric above and:
- Generate highly specific, affirming praise about their mastery of ${medium} technique
- Reference concrete, visible elements that demonstrate skill in ${medium}
- This is a celebration of their chosen craft — be warm and genuine`;
}

const OUTPUT_FORMAT = `

## Required Output Format

You MUST respond with a SINGLE valid JSON object — no preamble, no markdown fences, no text outside the JSON. The JSON object must contain EXACTLY these keys:

{
  "skillLevel": "advanced",
  "mediumMatch": true,
  "isAnalog": true,
  "experimentationLevel": "high",
  "critiqueText": "## Greeting\\n\\n[Warm, personal greeting...]\\n\\n## Strengths\\n\\n[...]\\n\\n## Opportunities for Growth\\n\\n[...]\\n\\n## Master Teacher's Final Note\\n\\n[...]",
  "critiquePins": [
    {"x": 25, "y": 30, "label": "Top-left quadrant", "advice": "The proportions feel compressed here..."}
  ]
}

### Field Rules:
- "skillLevel": use ONLY one of: "beginner", "intermediate", "advanced", "professional", "master". No other values.
- "mediumMatch": boolean — true ONLY if the artwork clearly uses the user's preferred medium
- "isAnalog": boolean — true if you detect physical/traditional art (canvas texture, real brushstrokes, paper grain, pencil graphite, charcoal dust)
- "experimentationLevel": "high" | "medium" | "low" — "high" if the artwork demonstrates risk-taking, mixed media, or unusual technique blending
- "critiqueText": a string containing your FULL markdown critique. This is the only text the student will read. It MUST be formatted as markdown with the sections below. Use \\n for line breaks within the string.
- "critiquePins": array of 2-4 objects, each with:
  - "x": number 0-100 (percentage from left)
  - "y": number 0-100 (percentage from top)
  - "label": short title for this area (e.g., "Top-left quadrant", "Center focal point", "Foreground edge")
  - "advice": specific master-level advice for this area (1-2 sentences, referencing visible elements)

### critiqueText Markdown Structure:

## Greeting

[Warm, personal greeting acknowledging the courage to share and welcoming the artist]

## Strengths

[Detailed, specific analysis of what works beautifully. Minimum 3 distinct strengths with explanation.]

## Opportunities for Growth

[Frame ALL critiques as growth opportunities. Provide 2-4 specific, actionable items. Each must include:]
- **[Specific Technique]:** [What to improve and exactly HOW to do it at a master level]

## Master Teacher's Final Note

[A brief, inspiring closing that acknowledges the artist's unique voice and encourages their next steps]

### Critical Rules:
- Output ONLY the JSON object. No text before or after it. No markdown code fences.
- The critiqueText value must be a properly escaped JSON string (use \\n for newlines, \\" for quotes).
- ALWAYS identify the medium and mention it in the critiqueText
- Be SPECIFIC about what you see — reference actual colors, shapes, and elements
- Ensure the JSON is valid and parseable`;

const AI_DETECTION_PROMPT = `You are an expert art authenticator specializing in distinguishing human-made artwork from AI-generated images.

Analyze the provided image for common indicators of AI generation:
- Illogical structural blending (elements that merge in physically impossible ways)
- Non-sensical details (extra fingers, warped text, impossible geometry, melted features)
- Signature or texture blurring that indicates upscaling or inpainting
- Inconsistent lighting or physics that no human artist would produce
- Hyper-smooth surfaces with no deliberate brush marks in areas that should have texture

Respond with ONLY a JSON object, no other text:
{"aiGenerated": true|false, "confidence": "high|medium|low", "reason": "brief explanation"}

Only return aiGenerated: true if you have clear evidence. When in doubt, favor the artist (return false).`;

const FOLLOWUP_PROMPT = `You are a world-class Master Art Teacher continuing a conversation with a student about their artwork. Be warm, specific, and actionable. Keep responses concise (150-300 words). Use markdown for structure. Reference the previous feedback context naturally.`;

const MASTERPIECE_STYLE_PROMPT = `You are an art analyst. Examine the provided artwork and describe its distinctive stylistic elements in 1-2 sentences. Focus on: color palette, brushwork/texture style, subject matter, and mood. This description will be used to generate a "masterpiece" image in the same style. Respond with ONLY the description, no preamble.`;

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

interface ApiCallResult {
  ok: boolean;
  text: string;
  error?: string;
}

function backoffDelay(attempt: number): number {
  return Math.min(2000 * Math.pow(2, attempt), 8000);
}

async function callGemini(model: string, apiKey: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
}

async function callOpenAIVision(apiKey: string, systemPrompt: string, userPrompt: string, imageBase64: string, mimeType: string, maxTokens: number, temperature: number): Promise<Response> {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ] },
      ],
      max_tokens: maxTokens,
      temperature,
      response_format: { type: "json_object" },
    }),
  });
}

async function callOpenAIText(apiKey: string, messages: Array<{ role: string; content: string }>, maxTokens: number, temperature: number): Promise<Response> {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages, max_tokens: maxTokens, temperature }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini / Gemma multi-model callers — try every model in the list before
// giving up.  Returns on the first success.
// ─────────────────────────────────────────────────────────────────────────────

async function tryGeminiVision(models: string[], apiKey: string, systemPrompt: string, imageBase64: string, mimeType: string, userPrompt: string, maxTokens: number, temperature: number, useJsonSchema: boolean): Promise<ApiCallResult> {
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    try {
      const body: Record<string, unknown> = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [
          { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } },
          { text: userPrompt },
        ] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      };
      if (useJsonSchema) {
        (body.generationConfig as Record<string, unknown>).responseMimeType = "application/json";
        (body.generationConfig as Record<string, unknown>).responseSchema = {
          type: "OBJECT",
          properties: {
            skillLevel: { type: "STRING", enum: ["beginner", "intermediate", "advanced", "professional", "master"] },
            mediumMatch: { type: "BOOLEAN" },
            isAnalog: { type: "BOOLEAN" },
            experimentationLevel: { type: "STRING", enum: ["high", "medium", "low"] },
            critiqueText: { type: "STRING" },
            critiquePins: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  x: { type: "NUMBER" },
                  y: { type: "NUMBER" },
                  label: { type: "STRING" },
                  advice: { type: "STRING" },
                },
                required: ["x", "y", "label", "advice"],
              },
            },
          },
          required: ["skillLevel", "mediumMatch", "isAnalog", "experimentationLevel", "critiqueText", "critiquePins"],
        };
      }
      const resp = await callGemini(model, apiKey, body, controller.signal);
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { ok: true, text };
      }
      if (resp.status === 429) await new Promise((r) => setTimeout(r, backoffDelay(i)));
    } catch {
      clearTimeout(timeout);
    }
  }
  return { ok: false, text: "", error: "All Gemini/Gemma models failed" };
}

async function tryGeminiTextOnly(models: string[], apiKey: string, systemPrompt: string, contents: unknown[], maxTokens: number, temperature: number): Promise<ApiCallResult> {
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const resp = await callGemini(model, apiKey, {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      });
      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { ok: true, text };
      }
      if (resp.status === 429) await new Promise((r) => setTimeout(r, backoffDelay(i)));
    } catch {
      // continue to next model
    }
  }
  return { ok: false, text: "", error: "All Gemini/Gemma models failed" };
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI fallback callers
// ─────────────────────────────────────────────────────────────────────────────

async function tryOpenAIVisionAnalysis(apiKey: string, systemPrompt: string, imageBase64: string, mimeType: string): Promise<ApiCallResult> {
  if (!apiKey) return { ok: false, text: "", error: "OpenAI API key not configured" };
  try {
    const resp = await callOpenAIVision(apiKey, systemPrompt, "Please analyze this artwork and provide your master-level feedback. Respond with ONLY a valid JSON object.", imageBase64, mimeType || "image/jpeg", 4096, 0.7);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return { ok: false, text: "", error: `OpenAI error: ${errText.slice(0, 200)}` };
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content;
    if (text) return { ok: true, text };
    return { ok: false, text: "", error: "No content from OpenAI" };
  } catch (err) {
    return { ok: false, text: "", error: err instanceof Error ? err.message : "OpenAI request failed" };
  }
}

async function tryOpenAIAIDetection(apiKey: string, imageBase64: string, mimeType: string): Promise<ApiCallResult> {
  if (!apiKey) return { ok: false, text: "" };
  try {
    const resp = await callOpenAIVision(apiKey, AI_DETECTION_PROMPT, "Analyze this image and determine if it is AI-generated. Respond with only the JSON object.", imageBase64, mimeType || "image/jpeg", 256, 0.2);
    if (!resp.ok) return { ok: false, text: "" };
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "";
    return { ok: true, text };
  } catch {
    return { ok: false, text: "" };
  }
}

async function tryOpenAIFollowup(apiKey: string, history: Array<{ role: string; content: string }>, previousFeedback: string): Promise<ApiCallResult> {
  if (!apiKey) return { ok: false, text: "", error: "OpenAI API key not configured" };
  try {
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: FOLLOWUP_PROMPT },
      { role: "user", content: `Previous feedback context:\n${previousFeedback}\n\nLet's discuss this further.` },
      ...history.map((msg) => ({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.content })),
    ];
    const resp = await callOpenAIText(apiKey, messages, 1024, 0.7);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return { ok: false, text: "", error: `OpenAI error: ${errText.slice(0, 200)}` };
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content;
    if (text) return { ok: true, text };
    return { ok: false, text: "", error: "No content from OpenAI" };
  } catch (err) {
    return { ok: false, text: "", error: err instanceof Error ? err.message : "OpenAI request failed" };
  }
}

async function tryOpenAIStyle(apiKey: string, imageBase64: string, mimeType: string): Promise<string | null> {
  if (!apiKey) return null;
  try {
    const resp = await callOpenAIVision(apiKey, MASTERPIECE_STYLE_PROMPT, "Describe the distinctive style of this artwork.", imageBase64, mimeType || "image/jpeg", 256, 0.5);
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON parsing
// ─────────────────────────────────────────────────────────────────────────────

const VALID_SKILL_LEVELS = ["beginner", "intermediate", "advanced", "professional", "master"];

interface CritiquePin {
  x: number;
  y: number;
  label: string;
  advice: string;
}

interface ScoringMetadata {
  skillLevel: string;
  mediumMatch: boolean;
  isAnalog: boolean;
  experimentationLevel: "high" | "medium" | "low";
  critiquePins: CritiquePin[];
}

function extractJsonFromText(raw: string): string | null {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  if (trimmed.startsWith("{")) return trimmed;
  const start = trimmed.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return trimmed.slice(start, i + 1);
    }
  }
  return null;
}

function parseAnalysisResponse(raw: string): (ScoringMetadata & { critiqueText: string }) | null {
  const jsonStr = extractJsonFromText(raw);
  if (!jsonStr) return null;
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed !== "object" || parsed === null) return null;

    const skillLevel = VALID_SKILL_LEVELS.includes(parsed.skillLevel) ? parsed.skillLevel : "beginner";
    const critiqueText = typeof parsed.critiqueText === "string" && parsed.critiqueText.trim() ? parsed.critiqueText.trim() : null;
    if (!critiqueText) return null;

    const pins: CritiquePin[] = Array.isArray(parsed.critiquePins)
      ? parsed.critiquePins
          .filter((p: unknown): p is CritiquePin =>
            typeof p === "object" && p !== null &&
            typeof (p as CritiquePin).x === "number" &&
            typeof (p as CritiquePin).y === "number" &&
            typeof (p as CritiquePin).advice === "string")
          .slice(0, 6)
      : [];

    return {
      skillLevel,
      mediumMatch: parsed.mediumMatch === true,
      isAnalog: parsed.isAnolog === true || parsed.isAnalog === true,
      experimentationLevel: ["high", "medium", "low"].includes(parsed.experimentationLevel) ? parsed.experimentationLevel : "low",
      critiquePins: pins,
      critiqueText,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

const ALL_VISION_MODELS = [...GEMINI_MODELS, ...GEMMA_MODELS];
const ALL_TEXT_MODELS = [...GEMINI_MODELS, ...GEMMA_MODELS];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

    if (!geminiApiKey && !openaiApiKey) {
      return new Response(JSON.stringify({ error: "No AI API keys are configured on the server." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Mode: Generate Masterpiece (DALL-E 3) ──
    if (body.mode === "generate-masterpiece") {
      const styleDescription = body.styleDescription || "a beautiful artistic masterpiece";
      const prompt = `Create a master-level artwork in the following style: ${styleDescription}. Make it breathtaking, gallery-worthy, and emotionally resonant. High quality, detailed.`;

      const dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openaiApiKey}` },
        body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024", quality: "standard", response_format: "b64_json" }),
      });

      if (!dalleResponse.ok) {
        const errText = await dalleResponse.text().catch(() => "");
        return new Response(JSON.stringify({ error: `Image generation failed: ${errText.slice(0, 200)}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const dalleData = await dalleResponse.json();
      const imageB64 = dalleData.data?.[0]?.b64_json;
      const imageUrl = dalleData.data?.[0]?.url;

      if (!imageB64 && !imageUrl) {
        return new Response(JSON.stringify({ error: "No image returned from DALL-E" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ imageBase64: imageB64 || null, imageUrl: imageUrl || null, prompt }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Mode: Analyze style for masterpiece generation ──
    if (body.mode === "analyze-style") {
      const { imageBase64, mimeType } = body;
      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "No image provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let description: string | null = null;
      if (geminiApiKey) {
        const result = await tryGeminiVision(ALL_VISION_MODELS, geminiApiKey, MASTERPIECE_STYLE_PROMPT, imageBase64, mimeType || "image/jpeg", "Describe the distinctive style of this artwork.", 256, 0.5, false);
        if (result.ok && result.text.trim()) description = result.text.trim();
      }
      if (!description) {
        description = await tryOpenAIStyle(openaiApiKey, imageBase64, mimeType || "image/jpeg");
      }

      if (!description) {
        return new Response(JSON.stringify({ error: "Style analysis failed — all AI providers are currently rate-limited. Please try again in a moment." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ styleDescription: description }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Mode: Follow-up conversation ──
    if (body.mode === "followup") {
      const history = body.history || [];
      const previousFeedback = body.previousFeedback || "";
      const contents = [
        { role: "user", parts: [{ text: `Previous feedback context:\n${previousFeedback}\n\nLet's discuss this further.` }] },
        ...history.map((msg: { role: string; content: string }) => ({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] })),
      ];

      let result: ApiCallResult = { ok: false, text: "", error: "No API keys" };
      if (geminiApiKey) {
        result = await tryGeminiTextOnly(ALL_TEXT_MODELS, geminiApiKey, FOLLOWUP_PROMPT, contents, 1024, 0.7);
      }
      if (!result.ok) {
        result = await tryOpenAIFollowup(openaiApiKey, history, previousFeedback);
      }

      if (!result.ok) {
        const message = result.error || "All AI providers are currently rate-limited. Please try again in a moment.";
        return new Response(JSON.stringify({ error: message }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ feedback: result.text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Mode: Artwork analysis (default) ──
    const { imageBase64, mimeType, preferredMedium, profilePrompt } = body;
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Step 1: AI detection pre-check
    let aiDetected = false;
    let aiResult: ApiCallResult = { ok: false, text: "" };
    if (geminiApiKey) {
      aiResult = await tryGeminiVision(ALL_VISION_MODELS, geminiApiKey, AI_DETECTION_PROMPT, imageBase64, mimeType || "image/jpeg", "Analyze this image and determine if it is AI-generated. Respond with only the JSON object.", 256, 0.2, false);
    }
    if (!aiResult.ok) {
      aiResult = await tryOpenAIAIDetection(openaiApiKey, imageBase64, mimeType || "image/jpeg");
    }

    if (aiResult.ok && aiResult.text) {
      try {
        const jsonMatch = aiResult.text.match(/\{[^}]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiDetected = parsed.aiGenerated === true && parsed.confidence !== "low";
        }
      } catch { /* proceed */ }
    }

    if (aiDetected) {
      return new Response(JSON.stringify({ aiDetected: true, feedback: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Step 2: Main artwork analysis
    let systemPrompt = SYSTEM_PROMPT_BASE;
    if (preferredMedium && preferredMedium !== "none" && preferredMedium !== "") {
      systemPrompt += buildMediumPrompt(preferredMedium);
    }
    if (profilePrompt && typeof profilePrompt === "string" && profilePrompt.trim()) {
      systemPrompt += "\n\nIMPORTANT - NEURODIVERGENT LEARNER ACCOMMODATION:\n" + profilePrompt + "\n\nFollow these accommodation guidelines as strictly as you follow the output format.";
    }
    systemPrompt += OUTPUT_FORMAT;

    let result: ApiCallResult = { ok: false, text: "", error: "No API keys" };
    if (geminiApiKey) {
      result = await tryGeminiVision(ALL_VISION_MODELS, geminiApiKey, systemPrompt, imageBase64, mimeType || "image/jpeg", "Please analyze this artwork and provide your master-level feedback. Respond with ONLY a valid JSON object.", 8192, 0.7, true);
    }
    if (!result.ok) {
      result = await tryOpenAIVisionAnalysis(openaiApiKey, systemPrompt, imageBase64, mimeType || "image/jpeg");
    }

    if (!result.ok || !result.text) {
      const message = result.error || "All AI providers are currently rate-limited. Please try again in a moment.";
      return new Response(JSON.stringify({ error: message, status: 502 }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const parsed = parseAnalysisResponse(result.text);
    if (!parsed) {
      return new Response(JSON.stringify({ error: "The AI response could not be parsed. Please try uploading your artwork again." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      aiDetected: false,
      feedback: parsed.critiqueText,
      skillLevel: parsed.skillLevel,
      mediumMatch: parsed.mediumMatch,
      isAnalog: parsed.isAnalog,
      experimentationLevel: parsed.experimentationLevel,
      critiquePins: parsed.critiquePins,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
