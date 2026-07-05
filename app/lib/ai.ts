import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { readFile, readdir } from "fs/promises";
import path from "path";
import { saveImage } from "./images";

type GeneratedConfession = {
  title: string;
  content: string;
  country: string;
  topic: string;
  tags: string[];
};

type AiValidationResponse =
  | {
      valid: true;
      title: string;
      content: string;
      country?: string;
      topic?: string;
      tags?: string[];
    }
  | {
      valid: false;
      error: string;
    };

const STYLE_REFERENCE_DIR_CANDIDATES = [
  process.env.AI_STYLE_REFERENCE_DIR,
  path.resolve(process.cwd(), "docs", "תמונות רפרנס לAI"),
  path.resolve(process.cwd(), "..", "docs", "תמונות רפרנס לAI"),
].filter((directory): directory is string => Boolean(directory));
const STYLE_REFERENCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const STYLE_REFERENCE_CONTENT_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

let styleReferenceImagePaths: Promise<string[]> | undefined;

export class PromptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptValidationError";
  }
}

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function normalizeTags(tags: unknown) {
  if (!Array.isArray(tags)) {
    return ["אחר"];
  }

  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function parseAiJson(content: string): AiValidationResponse {
  try {
    return JSON.parse(content) as AiValidationResponse;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("OpenAI did not return valid JSON");
    }

    return JSON.parse(match[0]) as AiValidationResponse;
  }
}

function normalizeValidationError(error: string | undefined) {
  const trimmed = error?.trim();

  if (!trimmed || trimmed.toLowerCase() === "hebrew error") {
    return "הוידוי לא מספיק מפורט. הוסיפו איפה זה קרה, מה קרה בפועל ולמה זו חוצפה.";
  }

  return trimmed;
}

const countryHints = [
  ["תאילנד", /תאילנד|תאילנדי|תאילנדית/],
  ["ספרד", /ספרד|ברצלונה|מדריד|ספרדי/],
  ["גרמניה", /גרמניה|ברלין|גרמני/],
  ["ארה״ב", /ארה״ב|ארצות הברית|אמריקה|אמריקאי/],
  ["טורקיה", /טורקיה|טורקי|איסטנבול/],
] as const;

function inferCountry(prompt: string) {
  return countryHints.find(([, pattern]) => pattern.test(prompt))?.[0] ?? "אחר";
}

function hasEnoughConcreteDetails(prompt: string) {
  const words = prompt.split(/\s+/).filter(Boolean);
  const hasHebrew = /[\u0590-\u05ff]/.test(prompt);
  const country = inferCountry(prompt);
  const hasEvent = /(פעם|היינו|כאשר|כש|בזמן|רחצ|עשיתי|לקחתי|עקפתי|הרבצ|ירק|שיקר)/.test(prompt);

  return hasHebrew && words.length >= 8 && hasEvent && (country !== "אחר" || prompt.length >= 45);
}

function fallbackConfession(prompt: string): GeneratedConfession {
  const country = inferCountry(prompt);
  const isAnimalStory = /פיל|פילים|חיה|חיות|קוף|כלב|חתול/.test(prompt);
  const hasAggression = /הרבצ|ירק|בעט|דחפ|מכה|הכיתי/.test(prompt);
  const topic = isAnimalStory || hasAggression ? "התנהגות לא ראויה" : "חוויות טיול";
  const title = isAnimalStory ? "הפיל והמטאטא" : "רגע לא להתגאות בו";
  const tags = [country !== "אחר" ? country : undefined, isAnimalStory ? "חיות" : "חוצפה", "וידוי"].filter(
    (tag): tag is string => Boolean(tag),
  );

  return {
    title,
    content: prompt,
    country,
    topic,
    tags: tags.slice(0, 3),
  };
}

export async function generateConfessionFromPrompt(prompt: string): Promise<GeneratedConfession> {
  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < 12) {
    throw new PromptValidationError("הוידוי קצר מדי. הוסיפו איפה זה קרה, מה קרה בפועל ולמה זו חוצפה.");
  }

  const client = getOpenAI();
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          [
            "You turn user prompts into short Hebrew Chutzpah AI confessions. Return only JSON with no markdown.",
            "Treat short but concrete prompts as valid. If the prompt includes an action and a location, country, nationality, or travel clue, infer the missing details and expand it into a coherent confession.",
            "Only reject prompts that are empty, gibberish, too vague to identify an event, or clearly not a confession.",
            "For invalid prompts, return a specific Hebrew user-facing error, for example: {\"valid\":false,\"error\":\"הוסיפו מה קרה בפועל, איפה זה קרה ולמה זו חוצפה.\"}. Never return the literal placeholder text \"Hebrew error\".",
            "For valid prompts, return {\"valid\":true,\"title\":\"כותרת בעברית\",\"content\":\"הטקסט המקורי של המשתמש ללא שינוי\",\"country\":\"מדינה/מיקום בעברית\",\"topic\":\"קטגוריה בעברית\",\"tags\":[\"עד 3 תגיות בעברית\"]}.",
            "Do not rewrite, expand, summarize, correct, or add to the user's confession paragraph. The content field must preserve the user's original prompt exactly.",
            "Keep the tone funny, light, sarcastic, and non-graphic. If the prompt describes rude or aggressive behavior, frame it as an embarrassing/regretful travel confession and do not glorify harm.",
          ].join(" "),
      },
      {
        role: "user",
        content: trimmedPrompt,
      },
    ],
  });

  const content = completion.choices[0]?.message.content;

  if (!content) {
    throw new Error("OpenAI did not return confession content");
  }

  const parsed = parseAiJson(content);

  if (!parsed.valid) {
    if (hasEnoughConcreteDetails(trimmedPrompt)) {
      return fallbackConfession(trimmedPrompt);
    }

    throw new PromptValidationError(normalizeValidationError(parsed.error));
  }

  return {
    title: parsed.title?.trim() || "וידוי חדש",
    content: trimmedPrompt,
    country: parsed.country?.trim() || "אחר",
    topic: parsed.topic?.trim() || "אחר",
    tags: normalizeTags(parsed.tags),
  };
}

function safeVisualStory(confession: GeneratedConfession) {
  const text = `${confession.title} ${confession.content} ${confession.tags.join(" ")}`;
  const location = confession.country === "אחר" ? "an overseas travel destination" : confession.country;

  if (/פיל|פילים|חיה|חיות/.test(text) && /הרבצ|בעט|מכה|הכיתי|מטאטא/.test(text)) {
    return `A tourist at an elephant washing activity in ${location} stands awkwardly with a broom lowered, looking sheepish. A calm elephant and a local guide look surprised from a comfortable distance.`;
  }

  if (/טוקטוק|טוק טוק|מונית|נהג|אוטובוס|רכבת|נסיעה/.test(text)) {
    return `A tourist beside local transportation in ${location} gestures too dramatically while a calm local driver looks confused. The scene feels like a funny travel-etiquette mix-up.`;
  }

  if (/צעק|צרח|קלל|ירק|הרבצ|בעט|דחפ|מכה|הכיתי/.test(text)) {
    return `A tourist in ${location} looks sheepish after an awkward etiquette mistake, while nearby locals react with puzzled expressions. Keep it playful and symbolic.`;
  }

  return `A playful travel scene in ${location} about ${confession.topic}, shown as a light social misunderstanding with expressive body language and clear local context.`;
}

function imagePrompt(confession: GeneratedConfession, variant: number, safest = false) {
  return [
    "Create a square image for a humorous Israeli travel anecdote.",
    "The background must always look like a realistic travel photograph with natural lighting, real-world depth, and recognizable location details.",
    "All people and characters must always be illustrated/cartoon characters composited into the realistic photographed background.",
    "Use the attached images only as references for the illustrated characters: match their palette, expressive treatment, and playful editorial-cartoon energy. Do not copy their exact scenes, characters, text, or layouts.",
    "Style: photorealistic environment, illustrated characters, saturated blues/reds/yellows, no text, no captions, no logos.",
    "Keep the scene friendly, symbolic, and suitable for a lighthearted public gallery.",
    `Variant: ${variant === 1 ? "wide scene with clear location context" : "closer character-focused scene with a different composition"}.`,
    `Country/location: ${confession.country}`,
    safest ? "Visual scene brief: A tourist has a funny etiquette misunderstanding near local transportation or a recognizable travel setting. Everyone is expressive, safe, and cartoonishly surprised." : `Topic: ${confession.topic}`,
    safest ? "Use only friendly expressions, open poses, clear travel context, and simple visual humor." : `Visual scene brief: ${safeVisualStory(confession)}`,
  ].join("\n");
}

async function readStyleReferenceImagePaths(directory: string) {
  try {
    const files = await readdir(directory);

    const imagePaths = files
      .filter((fileName) => STYLE_REFERENCE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .sort((first, second) => first.localeCompare(second))
      .slice(0, 16)
      .map((fileName) => path.join(directory, fileName));

    if (imagePaths.length > 0) {
      return imagePaths;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return [];
}

function getStyleReferenceImagePaths() {
  styleReferenceImagePaths ??= (async () => {
    for (const directory of STYLE_REFERENCE_DIR_CANDIDATES) {
      const imagePaths = await readStyleReferenceImagePaths(directory);

      if (imagePaths.length > 0) {
        return imagePaths;
      }
    }

    throw new Error(`No style reference images found in: ${STYLE_REFERENCE_DIR_CANDIDATES.join(", ")}`);
  })();

  return styleReferenceImagePaths;
}

async function createStyleReferenceFile(imagePath: string, index: number) {
  const extension = path.extname(imagePath).toLowerCase();
  const contentType = STYLE_REFERENCE_CONTENT_TYPES.get(extension);

  if (!contentType) {
    throw new Error(`Unsupported style reference image type: ${imagePath}`);
  }

  return toFile(await readFile(imagePath), `style-reference-${index + 1}${extension}`, { type: contentType });
}

async function uploadImage(b64Json: string) {
  return saveImage(Buffer.from(b64Json, "base64"), "image/png");
}

function isImageSafetyRejection(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return /safety system|safety_violations|rejected by the safety/i.test(message);
}

async function generateImageWithReferences(
  client: OpenAI,
  referenceImages: File[],
  confession: GeneratedConfession,
  variant: number,
  safest = false,
) {
  const image = await client.images.edit({
    model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2",
    image: referenceImages,
    prompt: imagePrompt(confession, variant, safest),
    n: 1,
    size: "1024x1024",
    quality: "low",
    output_format: "png",
  });

  const b64Json = image.data?.[0]?.b64_json;

  if (!b64Json) {
    throw new Error("OpenAI did not return generated image data");
  }

  return uploadImage(b64Json);
}

export async function generateImageOptions(confession: GeneratedConfession) {
  const client = getOpenAI();
  const referenceImagePaths = await getStyleReferenceImagePaths();
  const referenceImages = await Promise.all(referenceImagePaths.map(createStyleReferenceFile));

  return Promise.all(
    [1, 2].map(async (variant) => {
      try {
        return await generateImageWithReferences(client, referenceImages, confession, variant);
      } catch (error) {
        if (!isImageSafetyRejection(error)) {
          throw error;
        }

        return generateImageWithReferences(client, referenceImages, confession, variant, true);
      }
    }),
  );
}
