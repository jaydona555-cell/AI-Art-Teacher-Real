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

You are VERY conservative. Most artwork uploaded here is created by human artists. False accusations are harmful and demoralizing. Only flag AI when the evidence is overwhelming and unmistakable.

Indicators that MAY suggest AI generation (none of these alone is sufficient):
- Illogical structural blending (elements that merge in physically impossible ways)
- Non-sensical details (extra fingers, warped text, impossible geometry, melted features)
- Signature or texture blurring that indicates upscaling or inpainting
- Inconsistent lighting or physics that no human artist would produce
- Hyper-smooth surfaces with no deliberate brush marks in areas that should have texture

IMPORTANT: Many legitimate art styles (digital painting, photorealism, airbrush, smooth blending) can look "too clean." Do NOT flag artwork as AI simply because it looks smooth, polished, or highly refined. Human artists produce flawless work too. Only flag AI when you see MULTIPLE undeniable structural impossibilities that no human artist would produce.

Respond with ONLY a JSON object, no other text:
{"aiGenerated": true|false, "confidence": "high|medium|low", "reason": "brief explanation"}

Default to aiGenerated: false. Only return aiGenerated: true with confidence "high" when you have multiple, undeniable, structural anomalies. When in any doubt, favor the artist (return false).`;

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

    // ── Mode: Technique Guide (AI-generated step-by-step guide for any medium) ──
    if (body.mode === "oil-painting-demo") {
      const medium = body.medium || "oil";
      const technique = body.technique || "alla-prima";

      const MEDIUM_LABELS: Record<string, string> = {
        oil: "Oil Painting",
        watercolor: "Watercolor",
        charcoal: "Charcoal Drawing",
        pastel: "Pastel Painting",
      };
      const mediumLabel = MEDIUM_LABELS[medium] || MEDIUM_LABELS.oil;

      const TECHNIQUE_DESCRIPTIONS: Record<string, Record<string, string>> = {
        oil: {
          "alla-prima": "Alla Prima (wet-on-wet, single session painting)",
          "glazing": "Glazing (transparent color layers over a dry underpainting)",
          "impasto": "Impasto (thick, textured paint applied with brush or knife)",
          "underpainting": "Underpainting & Grisaille (monochrome value foundation)",
          "scumbling": "Scumbling (dry, opaque layers dragged over dried paint)",
          "fat-over-lean": "Fat-over-Lean Layering (progressive oil content for proper drying)",
        },
        watercolor: {
          "wet-on-wet": "Wet-on-Wet (applying wet paint to pre-soaked paper for soft, flowing edges)",
          "glazing": "Glazing & Layering (transparent washes built up over dry layers)",
          "dry-brush": "Dry Brush (minimal water on textured paper for broken, textured strokes)",
          "flat-wash": "Flat Wash (even, uniform color application across the paper)",
          "variegated-wash": "Variegated Wash (blending two or more colors in a single wet wash)",
          "lifting": "Lifting & Reserving (removing or protecting white paper for highlights)",
        },
        charcoal: {
          "vine-sketching": "Vine Charcoal Sketching (light, erasable layout and gesture drawing)",
          "compressed-shading": "Compressed Charcoal Shading (deep darks and rich value building)",
          "blending": "Blending & Smudging (stumps, tissues, and fingers for smooth gradients)",
          "subtractive": "Subtractive/Eraser Drawing (lifting charcoal to reveal light and form)",
          "white-highlights": "White Charcoal Highlights (adding light values and contrast on toned paper)",
          "fixative": "Fixative & Preservation (protecting finished charcoal drawings)",
        },
        pastel: {
          "underpainting": "Underpainting (establishing color and value base before pastel layers)",
          "dark-to-light": "Dark-to-Light Layering (building from dark foundations to bright highlights)",
          "scumbling": "Scumbling & Feathering (broken color strokes for optical mixing and texture)",
          "blending": "Blending & Softening (finger, tool, and tissue blending for smooth transitions)",
          "sgraffito": "Sgraffito (scratching through top layers to reveal underpainting beneath)",
          "edge-control": "Edge Control (managing hard, soft, and lost edges for depth and focus)",
        },
      };

      const mediumTechniques = TECHNIQUE_DESCRIPTIONS[medium] || TECHNIQUE_DESCRIPTIONS.oil;
      const techniqueName = mediumTechniques[technique] || mediumTechniques[Object.keys(mediumTechniques)[0]];

      const mediumContext: Record<string, string> = {
        oil: "oil painting instructor with decades of atelier teaching experience. Reference specific oil paint colors (e.g. ultramarine, burnt sienna, titanium white), mediums (linseed oil, Liquin, Gamsol), brush types (hog bristle flats, sable rounds, palette knives), and surfaces (linen canvas, gessoed panels).",
        watercolor: "watercolor painting instructor. Reference specific pigments (e.g. phthalo blue, quinacridone rose, raw sienna), brush types (squirrel mops, round synthetics, flat wash brushes), paper types (cold-pressed 140lb, hot-pressed, rough), and water control techniques. Emphasize paper preparation, water-to-pigment ratios, and timing.",
        charcoal: "charcoal drawing instructor. Reference vine/willow charcoal, compressed charcoal sticks and pencils, white charcoal, kneaded and vinyl erasers, blending stumps and tortillions, charcoal paper (Strathmore, toned paper), and fixatives. Emphasize value structure, mark-making, and the subtractive method.",
        pastel: "pastel painting instructor. Reference soft pastels, hard pastels, pastel pencils, surfaces (Pastelmat, sanded paper, UART), underpainting methods (watercolor, alcohol, ink), blending tools (fingers, foam pipe insulation, paper towels), and fixative considerations. Emphasize layering, color temperature, and edge control.",
      };

      const instructorContext = mediumContext[medium] || mediumContext.oil;

      const systemPrompt = `You are a master ${instructorContext} Create a structured, interactive lesson for the ${mediumLabel} technique: ${techniqueName}.

This is a TEACHING LESSON — not a critique, not a follow-up chat response, and not a simple tutorial list. It should feel like a master teacher sitting beside the student, walking them through everything they need to master this technique from the ground up.

Respond with ONLY a valid JSON object with this exact structure:
{
  "title": "string",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedTime": "string (e.g. '2-3 hours')",
  "overview": "string (2-3 paragraphs introducing the technique, its history, why it matters, and what the student will be able to do after completing this lesson — written in the teacher's warm, direct voice)",
  "learningObjectives": ["string", "string", ...] (4-6 specific, measurable things the student will learn),
  "materials": [{"name": "string", "purpose": "string", "notes": "string"}] (specific supplies with why each is needed),
  "steps": [{"title": "string", "instruction": "string (detailed markdown)", "tip": "string (a pro tip for this step)"}] (5-7 sequential steps, each with rich instruction),
  "commonMistakes": [{"mistake": "string", "fix": "string"}] (4-5 pitfalls and how to correct them),
  "exercises": [{"name": "string", "description": "string", "duration": "string"}] (3-4 practice exercises the student can do to build the skill),
  "masterReferences": ["string", ...] (2-3 famous artworks or artists that exemplify this technique, with a sentence about what to study in each)
}

Be specific and thorough. Write each step's instruction as if you are standing next to the student, explaining exactly what to do and why. Use markdown formatting within the instruction fields. Be specific about colors, tools, surfaces, and techniques.`;

      let result: ApiCallResult = { ok: false, text: "", error: "No API keys" };
      if (geminiApiKey) {
        result = await tryGeminiTextOnly(ALL_TEXT_MODELS, geminiApiKey, systemPrompt, [{ role: "user", parts: [{ text: `Create a comprehensive ${mediumLabel} process guide for: ${techniqueName}` }] }], 4096, 0.7);
      }
      if (!result.ok) {
        if (!openaiApiKey) {
          return new Response(JSON.stringify({ error: result.error || "All AI providers failed" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const resp = await callOpenAIText(openaiApiKey, [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a comprehensive ${mediumLabel} process guide for: ${techniqueName}` },
        ], 4096, 0.7);
        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) result = { ok: true, text };
        }
      }

      if (!result.ok || !result.text) {
        return new Response(JSON.stringify({ error: result.error || "Failed to generate technique guide" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let parsedLesson: {
        title?: string; difficulty?: string; estimatedTime?: string;
        overview?: string; learningObjectives?: string[];
        materials?: Array<{ name: string; purpose: string; notes?: string }>;
        steps?: Array<{ title: string; instruction: string; tip?: string }>;
        commonMistakes?: Array<{ mistake: string; fix: string }>;
        exercises?: Array<{ name: string; description: string; duration?: string }>;
        masterReferences?: string[];
        guide?: string;
      } | null = null;
      try {
        const jsonStr = extractJsonFromText(result.text);
        if (jsonStr) parsedLesson = JSON.parse(jsonStr);
      } catch { /* fall through */ }

      if (!parsedLesson || (!parsedLesson.overview && !parsedLesson.guide)) {
        return new Response(JSON.stringify({
          title: techniqueName,
          difficulty: "intermediate",
          estimatedTime: "2-4 hours",
          overview: result.text.slice(0, 2000),
          learningObjectives: [],
          materials: [],
          steps: [],
          commonMistakes: [],
          exercises: [],
          masterReferences: [],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        title: parsedLesson.title || techniqueName,
        difficulty: parsedLesson.difficulty || "intermediate",
        estimatedTime: parsedLesson.estimatedTime || "2-4 hours",
        overview: parsedLesson.overview || "",
        learningObjectives: parsedLesson.learningObjectives || [],
        materials: parsedLesson.materials || [],
        steps: parsedLesson.steps || [],
        commonMistakes: parsedLesson.commonMistakes || [],
        exercises: parsedLesson.exercises || [],
        masterReferences: parsedLesson.masterReferences || [],
        mediumName: mediumLabel,
        techniqueName,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Mode: Generate Speedpaint (4 progressive DALL-E stages) ──
    if (body.mode === "generate-speedpaint") {
      const styleDescription = body.styleDescription || "a beautiful artistic masterpiece";
      const stages = [
        { label: "Rough Sketch", instruction: "Create ONLY a very rough, loose pencil sketch — light construction lines, basic shapes and proportions, minimal detail, mostly empty white canvas with faint graphite marks. Same composition and subject as the final work below." },
        { label: "Block-In", instruction: "Create an underpainting / block-in stage — flat color shapes blocking in major forms, no fine detail, rough value structure, visible brush strokes establishing the composition. Mid-progress." },
        { label: "Refinement", instruction: "Create a refined mid-stage — most details rendered, blending and modeling underway, some areas still loose, colors developed, 80% complete." },
        { label: "Finished Work", instruction: "Create the finished, complete artwork — fully rendered, all details complete, polished and gallery-ready." },
      ];

      const stageResults: { label: string; imageBase64: string | null; imageUrl: string | null }[] = [];
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const stagePrompt = `${stage.instruction} Style: ${styleDescription}. Artwork quality, single coherent piece.`;
        const dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openaiApiKey}` },
          body: JSON.stringify({ model: "dall-e-3", prompt: stagePrompt, n: 1, size: "1024x1024", quality: "standard", response_format: "b64_json" }),
        });

        if (!dalleResponse.ok) {
          const errText = await dalleResponse.text().catch(() => "");
          return new Response(JSON.stringify({ error: `Speedpaint stage ${i + 1} failed: ${errText.slice(0, 200)}`, partialStages: stageResults }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const dalleData = await dalleResponse.json();
        const imageB64 = dalleData.data?.[0]?.b64_json;
        const imageUrl = dalleData.data?.[0]?.url;
        if (!imageB64 && !imageUrl) {
          return new Response(JSON.stringify({ error: `Speedpaint stage ${i + 1} returned no image`, partialStages: stageResults }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        stageResults.push({ label: stage.label, imageBase64: imageB64 || null, imageUrl: imageUrl || null });
      }

      return new Response(JSON.stringify({ stages: stageResults }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    // ── Mode: Lesson Tutor (AI chat within a lesson, context-aware) ──
    if (body.mode === "lesson-tutor") {
      const history = body.history || [];
      const lessonContext = body.lessonContext || "";
      const techniqueName = body.techniqueName || "";
      const mediumName = body.mediumName || "";

      const LESSON_TUTOR_PROMPT = `You are a master art teacher conducting a one-on-one lesson on ${techniqueName} in ${mediumName}. The student is currently working through a structured lesson you created. Your role is to answer their questions, demonstrate concepts, and guide them through the technique — NOT to critique artwork.

LESSON CONTEXT (the guide the student is reading):
${lessonContext}

Guidelines:
- Answer questions specifically about the technique, materials, or steps in the lesson
- If a student is confused about a step, break it down further or offer an alternative explanation
- Suggest mini-exercises they can try right now to build the skill
- Share relevant art history or master examples when it helps understanding
- Keep responses concise (100-200 words) and conversational — this is a dialogue, not a lecture
- Use markdown for clarity (bold key terms, bullet lists for steps)
- Never reference "the feedback" or "your artwork" — this is a technique lesson, not a critique session`;

      const contents = [
        { role: "user", parts: [{ text: `Lesson context: ${techniqueName} in ${mediumName}.\n\n${lessonContext}\n\nThe student has questions about this lesson.` }] },
        ...history.map((msg: { role: string; content: string }) => ({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] })),
      ];

      let result: ApiCallResult = { ok: false, text: "", error: "No API keys" };
      if (geminiApiKey) {
        result = await tryGeminiTextOnly(ALL_TEXT_MODELS, geminiApiKey, LESSON_TUTOR_PROMPT, contents, 1024, 0.7);
      }
      if (!result.ok) {
        if (!openaiApiKey) {
          return new Response(JSON.stringify({ error: result.error || "All AI providers failed" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const resp = await callOpenAIText(openaiApiKey, [
          { role: "system", content: LESSON_TUTOR_PROMPT },
          { role: "user", content: `Lesson: ${techniqueName} in ${mediumName}. The student has questions.` },
          ...history.map((msg) => ({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.content })),
        ], 1024, 0.7);
        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) result = { ok: true, text };
        }
      }

      if (!result.ok || !result.text) {
        return new Response(JSON.stringify({ error: result.error || "Failed to get tutor response" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ feedback: result.text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Mode: Practice Review (technique-specific critique of a practice attempt) ──
    if (body.mode === "practice-review") {
      const { imageBase64, mimeType, mediumName, techniqueName, lessonContext } = body;
      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "No image provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const PRACTICE_REVIEW_PROMPT = `You are a master art teacher reviewing a student's practice attempt at ${techniqueName} in ${mediumName}. The student has been following a structured lesson and is now submitting their practice work for targeted feedback.

LESSON CONTEXT (what the student was learning):
${lessonContext || "(lesson context not provided)"}

Your feedback should:
- Be warm, encouraging, and specific — celebrate what they did well before pointing out areas to improve
- Focus on how well their work demonstrates the specific technique (${techniqueName}) they were practicing
- Reference specific steps, concepts, or exercises from the lesson
- Give 2-3 concrete, actionable suggestions for improvement tied to the technique
- End with a "Next Step" — one specific thing to try in their next practice session
- Be concise (200-350 words) and use markdown for structure

Do NOT run AI detection on this image. The student is submitting their own practice work from a lesson. Do NOT score or assign a skill level. This is practice feedback, not a formal critique.

Respond with ONLY a valid JSON object:
{"feedback": "string (your markdown feedback)", "strengths": ["string", ...] (2-3 things they did well), "improvements": ["string", ...] (2-3 areas to work on), "nextStep": "string (one specific next action)"}`;

      let result: ApiCallResult = { ok: false, text: "", error: "No API keys" };
      if (geminiApiKey) {
        result = await tryGeminiVision(ALL_VISION_MODELS, geminiApiKey, PRACTICE_REVIEW_PROMPT, imageBase64, mimeType || "image/jpeg", "Review this practice attempt and provide technique-focused feedback. Respond with ONLY a valid JSON object.", 2048, 0.7, true);
      }
      if (!result.ok) {
        if (!openaiApiKey) {
          return new Response(JSON.stringify({ error: result.error || "All AI providers failed" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const resp = await callOpenAIVision(openaiApiKey, PRACTICE_REVIEW_PROMPT, "Review this practice attempt and provide technique-focused feedback. Respond with ONLY a valid JSON object.", imageBase64, mimeType || "image/jpeg", 2048, 0.7);
        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) result = { ok: true, text };
        }
      }

      if (!result.ok || !result.text) {
        return new Response(JSON.stringify({ error: result.error || "Failed to review practice work" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let parsedReview: { feedback?: string; strengths?: string[]; improvements?: string[]; nextStep?: string } | null = null;
      try {
        const jsonStr = extractJsonFromText(result.text);
        if (jsonStr) parsedReview = JSON.parse(jsonStr);
      } catch { /* fall through */ }

      if (!parsedReview || !parsedReview.feedback) {
        return new Response(JSON.stringify({
          feedback: result.text.slice(0, 2000),
          strengths: [],
          improvements: [],
          nextStep: "",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        feedback: parsedReview.feedback,
        strengths: parsedReview.strengths || [],
        improvements: parsedReview.improvements || [],
        nextStep: parsedReview.nextStep || "",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
          aiDetected = parsed.aiGenerated === true && parsed.confidence === "high";
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
