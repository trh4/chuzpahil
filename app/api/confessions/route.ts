import { type NextRequest } from "next/server";
import { jsonError, unknownErrorMessage } from "@/app/lib/api";
import { mapConfession, sql } from "@/app/lib/db";
import { countryOptions, topicOptions, type SortValue } from "@/app/lib/confessions";

export const runtime = "nodejs";

const sortSql: Record<SortValue, string> = {
  random: "random()",
  newest: "created_at DESC",
  oldest: "created_at ASC",
  "most-chutzpah": "average_chutzpah_score DESC, created_at DESC",
  "most-polite": "average_chutzpah_score ASC, created_at DESC",
};

function normalizeSort(value: string | null): SortValue {
  if (value === "most_chutzpah") {
    return "most-chutzpah";
  }
  if (value === "most_polite") {
    return "most-polite";
  }
  if (value === "newest" || value === "oldest" || value === "most-chutzpah" || value === "most-polite") {
    return value;
  }

  return "random";
}

function buildFilterOptions(rows: Record<string, unknown>[]) {
  const countries = new Set<string>(countryOptions);
  const topics = new Set<string>(topicOptions);
  const staticTopics = new Set<string>(topicOptions);

  for (const row of rows) {
    const country = typeof row.country === "string" ? row.country.trim() : "";
    const topic = typeof row.topic === "string" ? row.topic.trim() : "";
    const tags = Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()) : [];

    if (country && !staticTopics.has(country)) {
      countries.add(country);
    }
    if (topic) {
      topics.add(topic);
    }

    for (const tag of tags) {
      if (!tag || tag === "אחר") {
        continue;
      }

      if (staticTopics.has(tag)) {
        topics.add(tag);
      } else {
        countries.add(tag);
      }
    }
  }

  return {
    countries: [...countries],
    topics: [...topics],
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: unknown[] = [];
    const where = ["status = 'published'"];

    const addParam = (value: unknown) => {
      params.push(value);
      return `$${params.length}`;
    };

    const search = searchParams.get("search")?.trim();
    if (search) {
      const placeholder = addParam(`%${search}%`);
      where.push(
        `(title ILIKE ${placeholder} OR content ILIKE ${placeholder} OR country ILIKE ${placeholder} OR topic ILIKE ${placeholder} OR EXISTS (SELECT 1 FROM unnest(tags) tag WHERE tag ILIKE ${placeholder}))`,
      );
    }

    const country = searchParams.get("country")?.trim();
    if (country) {
      const placeholder = addParam(country);
      where.push(`(country = ${placeholder} OR ${placeholder} = ANY(tags))`);
    }

    const topic = searchParams.get("topic")?.trim();
    if (topic) {
      const placeholder = addParam(topic);
      where.push(`(topic = ${placeholder} OR ${placeholder} = ANY(tags))`);
    }

    const tag = searchParams.get("tag")?.trim();
    if (tag) {
      const placeholder = addParam(tag);
      where.push(`${placeholder} = ANY(tags)`);
    }

    const sort = normalizeSort(searchParams.get("sort"));
    const query = `
      SELECT
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
      FROM confessions
      WHERE ${where.join(" AND ")}
      ORDER BY ${sortSql[sort]}
      LIMIT 80
    `;

    const rows = await sql.query(query, params);
    const filterRows = await sql`
      SELECT country, topic, tags
      FROM confessions
      WHERE status = 'published'
    `;

    return Response.json({ confessions: rows.map(mapConfession), filterOptions: buildFilterOptions(filterRows) });
  } catch (error) {
    return jsonError(unknownErrorMessage(error));
  }
}
