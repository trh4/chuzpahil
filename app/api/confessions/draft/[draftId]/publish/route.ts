import { jsonError, readJson, unknownErrorMessage } from "@/app/lib/api";
import { mapConfession, sql } from "@/app/lib/db";

export const runtime = "nodejs";

type PublishRequest = {
  selectedImageUrl?: string;
};

export async function POST(request: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const body = await readJson<PublishRequest>(request);
    const selectedImageUrl = body.selectedImageUrl?.trim();

    if (!selectedImageUrl) {
      return jsonError("נא לבחור תמונה לפני הפרסום.", 400);
    }

    const draftRows = await sql`
      SELECT
        id,
        generated_title,
        generated_content,
        country,
        topic,
        generated_tags,
        image_options
      FROM confession_drafts
      WHERE id = ${draftId}
      LIMIT 1
    `;
    const draft = draftRows[0];

    if (!draft) {
      return jsonError("Draft not found", 404);
    }

    const imageOptions = (draft.image_options ?? []) as string[];

    if (!imageOptions.includes(selectedImageUrl)) {
      return jsonError("Selected image does not belong to this draft", 400);
    }

    const confessionRows = await sql`
      INSERT INTO confessions (
        title,
        content,
        country,
        topic,
        tags,
        image_url,
        status
      )
      VALUES (
        ${draft.generated_title},
        ${draft.generated_content},
        ${draft.country},
        ${draft.topic},
        ${draft.generated_tags},
        ${selectedImageUrl},
        'published'
      )
      RETURNING
        id,
        seed_key,
        title,
        content,
        country,
        topic,
        tags,
        image_url,
        created_at,
        ratings_count,
        CASE WHEN ratings_count = 0 THEN 0 ELSE ratings_sum::numeric / ratings_count END AS average_chutzpah_score
    `;

    await sql`DELETE FROM confession_drafts WHERE id = ${draftId}`;

    return Response.json({ confession: mapConfession(confessionRows[0]) }, { status: 201 });
  } catch (error) {
    return jsonError(unknownErrorMessage(error));
  }
}
