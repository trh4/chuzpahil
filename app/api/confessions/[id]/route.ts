import { jsonError, unknownErrorMessage } from "@/app/lib/api";
import { mapConfession, sql } from "@/app/lib/db";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await sql`
      SELECT
        id,
        title,
        content,
        country,
        topic,
        tags,
        image_url,
        created_at,
        ratings_count,
        CASE WHEN ratings_count = 0 THEN 0 ELSE ratings_sum::numeric / ratings_count END AS average_chutzpah_score
      FROM confessions
      WHERE id = ${id}
        AND status = 'published'
      LIMIT 1
    `;

    if (!rows[0]) {
      return jsonError("Confession not found", 404);
    }

    return Response.json({ confession: mapConfession(rows[0]) });
  } catch (error) {
    return jsonError(unknownErrorMessage(error));
  }
}
