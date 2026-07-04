import { sql } from "./db";

export function imageApiPath(id: string) {
  return `/api/images/${id}`;
}

function toBuffer(value: unknown) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (typeof value === "string") {
    if (value.startsWith("\\x")) {
      return Buffer.from(value.slice(2), "hex");
    }

    return Buffer.from(value, "base64");
  }

  throw new Error("Unsupported image data format");
}

export async function saveImage(data: Buffer, contentType = "image/png") {
  const rows = await sql`
    INSERT INTO images (data, content_type)
    VALUES (${data}, ${contentType})
    RETURNING id
  `;

  return imageApiPath(String(rows[0].id));
}

export async function getImage(id: string) {
  const rows = await sql`
    SELECT data, content_type
    FROM images
    WHERE id = ${id}
    LIMIT 1
  `;

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    buffer: toBuffer(row.data),
    contentType: String(row.content_type),
  };
}
