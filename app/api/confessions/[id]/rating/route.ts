import { type NextRequest, NextResponse } from "next/server";
import { jsonError, readJson, unknownErrorMessage } from "@/app/lib/api";
import { mapConfession, sql } from "@/app/lib/db";

export const runtime = "nodejs";

type RatingRequest = {
  score?: number;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await readJson<RatingRequest>(request);
    const score = Number(body.score);

    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return jsonError("Rating must be an integer between 0 and 100", 400);
    }

    const existingClientId = request.cookies.get("chutzpah_client_id")?.value;
    const clientId = existingClientId || crypto.randomUUID();

    const [, rows] = await sql.transaction([
      sql`
        INSERT INTO ratings (confession_id, score, client_id)
        VALUES (${id}, ${score}, ${clientId})
        ON CONFLICT (confession_id, client_id)
        DO UPDATE SET
          score = EXCLUDED.score,
          updated_at = now()
      `,
      sql`
        WITH aggregate AS (
          SELECT
            count(*)::int AS ratings_count,
            coalesce(sum(score), 0)::int AS ratings_sum
          FROM ratings
          WHERE confession_id = ${id}
        )
        UPDATE confessions
        SET
          ratings_count = aggregate.ratings_count,
          ratings_sum = aggregate.ratings_sum
        FROM aggregate
        WHERE confessions.id = ${id}
          AND confessions.status = 'published'
        RETURNING
          id,
          title,
          content,
          country,
          topic,
          tags,
          image_url,
          created_at,
          confessions.ratings_count AS ratings_count,
          CASE
            WHEN confessions.ratings_count = 0 THEN 0
            ELSE confessions.ratings_sum::numeric / confessions.ratings_count
          END AS average_chutzpah_score
      `,
    ]);

    if (!rows[0]) {
      return jsonError("Confession not found", 404);
    }

    const response = NextResponse.json({ confession: mapConfession(rows[0]), score });
    response.cookies.set("chutzpah_client_id", clientId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (error) {
    return jsonError(unknownErrorMessage(error));
  }
}
