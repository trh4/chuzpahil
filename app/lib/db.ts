import { neon } from "@neondatabase/serverless";
import type { Confession, ConfessionDraft } from "./confessions";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export const sql = neon(process.env.DATABASE_URL);

const hebrewMonths = [
  "בינואר",
  "בפברואר",
  "במרץ",
  "באפריל",
  "במאי",
  "ביוני",
  "ביולי",
  "באוגוסט",
  "בספטמבר",
  "באוקטובר",
  "בנובמבר",
  "בדצמבר",
];

export function formatHebrewDate(value: string | Date) {
  const date = new Date(value);
  const day = date.getDate();
  const month = hebrewMonths[date.getMonth()] ?? "";
  const year = date.getFullYear();
  const time = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem",
  }).format(date);

  return `${day} ${month} ${year}, ${time}`;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function stringArrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function mapConfession(row: Record<string, unknown>): Confession {
  const createdAtValue = row.created_at as string | Date;
  const createdAt = new Date(createdAtValue).toISOString();
  const averageScore = Number(row.average_chutzpah_score ?? 0);

  return {
    id: stringValue(row.id),
    title: stringValue(row.title),
    date: formatHebrewDate(createdAtValue),
    createdAt,
    timestamp: new Date(createdAtValue).getTime(),
    content: stringValue(row.content),
    country: stringValue(row.country, "אחר"),
    topic: stringValue(row.topic, "אחר"),
    tags: stringArrayValue(row.tags),
    image: stringValue(row.image_url),
    averageScore: Math.round(averageScore),
    ratingsCount: Number(row.ratings_count),
  };
}

export function mapDraft(row: Record<string, unknown>): ConfessionDraft {
  return {
    id: stringValue(row.id),
    prompt: stringValue(row.prompt),
    title: stringValue(row.generated_title),
    content: stringValue(row.generated_content),
    country: stringValue(row.country, "אחר"),
    topic: stringValue(row.topic, "אחר"),
    tags: stringArrayValue(row.generated_tags),
    imageOptions: stringArrayValue(row.image_options),
    createdAt: new Date(row.created_at as string | Date).toISOString(),
  };
}
