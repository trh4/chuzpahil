import { put } from "@vercel/blob";
import OpenAI from "openai";

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
          "You turn user prompts into short Hebrew Chutzpah AI confessions. Return only JSON. Validate the prompt first. If it is too short, lacks a location/country, or lacks a clear event, return {\"valid\":false,\"error\":\"Hebrew error\"}. If valid, return {\"valid\":true,\"title\":\"Hebrew title\",\"content\":\"Hebrew confession text, 2-4 sentences\",\"country\":\"Hebrew country/location\",\"topic\":\"Hebrew category\",\"tags\":[\"up to 3 Hebrew tags\"]}. Keep the tone funny, light, sarcastic, and non-graphic. Do not include markdown.",
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
    throw new PromptValidationError(parsed.error || "הוידוי לא מספיק מפורט. הוסיפו מדינה, מה קרה ולמה זו חוצפה.");
  }

  return {
    title: parsed.title?.trim() || "וידוי חדש",
    content: parsed.content?.trim() || trimmedPrompt,
    country: parsed.country?.trim() || "אחר",
    topic: parsed.topic?.trim() || "אחר",
    tags: normalizeTags(parsed.tags),
  };
}

function imagePrompt(confession: GeneratedConfession, variant: number) {
  return [
    "Create a square colorful comic-style illustration for a humorous Israeli travel confession.",
    "Style: bold flat shapes, warm cream background, saturated blues/reds/yellows, expressive characters, playful editorial cartoon, no text, no captions, no logos.",
    `Variant: ${variant === 1 ? "wide scene with clear location context" : "closer character-focused scene with a different composition"}.`,
    `Title: ${confession.title}`,
    `Country/location: ${confession.country}`,
    `Topic: ${confession.topic}`,
    `Story: ${confession.content}`,
  ].join("\n");
}

async function uploadImage(b64Json: string, draftKey: string, variant: number) {
  const imageBuffer = Buffer.from(b64Json, "base64");
  const blob = await put(`confession-drafts/${draftKey}/option-${variant}.png`, imageBuffer, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: true,
  });

  return blob.url;
}

export async function generateImageOptions(confession: GeneratedConfession, draftKey: string) {
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

      return uploadImage(b64Json, draftKey, variant);
    }),
  );
}
