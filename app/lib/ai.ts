import OpenAI from "openai";
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
  const location = country === "אחר" ? "בחו״ל" : `ב${country}`;
  const isAnimalStory = /פיל|פילים|חיה|חיות|קוף|כלב|חתול/.test(prompt);
  const hasAggression = /הרבצ|ירק|בעט|דחפ|מכה|הכיתי/.test(prompt);
  const topic = isAnimalStory || hasAggression ? "התנהגות לא ראויה" : "חוויות טיול";
  const title = isAnimalStory ? "הפיל והמטאטא" : "רגע לא להתגאות בו";
  const tags = [country !== "אחר" ? country : undefined, isAnimalStory ? "חיות" : "חוצפה", "וידוי"].filter(
    (tag): tag is string => Boolean(tag),
  );

  return {
    title,
    content: `במהלך טיול ${location}, קרה רגע שאני ממש לא גאה בו: ${prompt}. באותו רגע זה אולי נראה לי מצחיק או קטן, אבל בדיעבד זו הייתה חוצפה מכוערת ולא מכבדת. זה מסוג הסיפורים שמספרים רק כדי להודות בטעות, לא כדי להתגאות בה.`,
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
            "For valid prompts, return {\"valid\":true,\"title\":\"כותרת בעברית\",\"content\":\"טקסט וידוי בעברית, 2-4 משפטים\",\"country\":\"מדינה/מיקום בעברית\",\"topic\":\"קטגוריה בעברית\",\"tags\":[\"עד 3 תגיות בעברית\"]}.",
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
    content: parsed.content?.trim() || trimmedPrompt,
    country: parsed.country?.trim() || "אחר",
    topic: parsed.topic?.trim() || "אחר",
    tags: normalizeTags(parsed.tags),
  };
}

function safeVisualStory(confession: GeneratedConfession) {
  const text = `${confession.title} ${confession.content} ${confession.tags.join(" ")}`;

  if (/פיל|פילים|חיה|חיות/.test(text) && /הרבצ|בעט|מכה|הכיתי|מטאטא/.test(text)) {
    return `A tourist at an elephant washing activity in ${confession.country} stands awkwardly with a broom lowered, looking embarrassed. A calm elephant and a local guide look surprised. Show only the non-violent aftermath, with no hitting or harm.`;
  }

  if (/ירק|הרבצ|בעט|דחפ|מכה|הכיתי/.test(text)) {
    return `A tourist in ${confession.country} looks embarrassed after causing an awkward social incident, while nearby locals react with surprise. Show only the aftermath, no physical contact, no bodily fluids, no harm.`;
  }

  return confession.content;
}

function imagePrompt(confession: GeneratedConfession, variant: number) {
  return [
    "Create a square colorful comic-style illustration for a humorous Israeli travel confession.",
    "Style: bold flat shapes, warm cream background, saturated blues/reds/yellows, expressive characters, playful editorial cartoon, no text, no captions, no logos.",
    "If the story includes rude or aggressive behavior, depict the awkward social situation or aftermath in a non-violent symbolic way; do not show physical assault, bodily fluids, gore, or humiliation.",
    `Variant: ${variant === 1 ? "wide scene with clear location context" : "closer character-focused scene with a different composition"}.`,
    `Title: ${confession.title}`,
    `Country/location: ${confession.country}`,
    `Topic: ${confession.topic}`,
    `Visual scene brief: ${safeVisualStory(confession)}`,
  ].join("\n");
}

async function uploadImage(b64Json: string) {
  return saveImage(Buffer.from(b64Json, "base64"), "image/png");
}

export async function generateImageOptions(confession: GeneratedConfession) {
  const client = getOpenAI();

  return Promise.all(
    [1, 2].map(async (variant) => {
      const image = await client.images.generate({
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
        prompt: imagePrompt(confession, variant),
        n: 1,
        size: "1024x1024",
        quality: "low",
        output_format: "png",
        moderation: "low",
      });

      const b64Json = image.data?.[0]?.b64_json;

      if (!b64Json) {
        throw new Error("OpenAI did not return generated image data");
      }

      return uploadImage(b64Json);
    }),
  );
}
