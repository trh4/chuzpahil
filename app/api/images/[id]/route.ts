import { getImage } from "@/app/lib/images";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await getImage(id);

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(image.buffer), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
