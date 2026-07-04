import { jsonError, unknownErrorMessage } from "@/app/lib/api";
import { sql } from "@/app/lib/db";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const rows = await sql`
      DELETE FROM confession_drafts
      WHERE id = ${draftId}
      RETURNING id
    `;

    if (!rows[0]) {
      return jsonError("Draft not found", 404);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(unknownErrorMessage(error));
  }
}
