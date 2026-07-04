import { jsonError, readJson, unknownErrorMessage } from "@/app/lib/api";
import { generateConfessionFromPrompt, generateImageOptions, PromptValidationError } from "@/app/lib/ai";
import { mapDraft, sql } from "@/app/lib/db";

export const runtime = "nodejs";
export const maxDuration = 90;

type DraftRequest = {
  prompt?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<DraftRequest>(request);
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return jsonError("נא לכתוב וידוי לפני השליחה.", 400);
    }

    const generated = await generateConfessionFromPrompt(prompt);
    const imageOptions = await generateImageOptions(generated);
    const rows = await sql`
      INSERT INTO confession_drafts (
        prompt,
        generated_title,
        generated_content,
        country,
        topic,
        generated_tags,
        image_options
      )
      VALUES (
        ${prompt},
        ${generated.title},
        ${generated.content},
        ${generated.country},
        ${generated.topic},
        ${generated.tags},
        ${imageOptions}
      )
      RETURNING
        id,
        prompt,
        generated_title,
        generated_content,
        country,
        topic,
        generated_tags,
        image_options,
        created_at
    `;

    return Response.json({ draft: mapDraft(rows[0]) }, { status: 201 });
  } catch (error) {
    if (error instanceof PromptValidationError) {
      return jsonError(error.message, 422);
    }

    return jsonError(unknownErrorMessage(error));
  }
}
