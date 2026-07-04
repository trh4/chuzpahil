import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const sql = neon(process.env.DATABASE_URL);
const migrationName = "001_initial_chutzpah_schema";

const seedConfessions = [
  {
    seedKey: "bracelet",
    title: "הצמיד",
    content:
      "היינו בפארק מים בפוקט והיה לנו צמיד Fast Pass שהיה תקף רק למתקן אחד. די מהר גילינו שאף אחד לא באמת בודק למה הוא תקף, אז פשוט הראינו אותו בכל תור. אנשים ראו את הצמיד ונתנו לנו לעקוף בלי לשאול שאלות.",
    country: "תאילנד",
    topic: "קומבינה",
    tags: ["תור", "קומבינה", "תאילנד"],
    imageUrl: "/images/ill-waterpark.png",
    createdAt: "2026-05-30T17:00:00+03:00",
    averageScore: 65,
    ratingsCount: 8,
  },
  {
    seedKey: "souvenir-mugs",
    title: "ספלים למזכרת",
    content:
      "אני ואשתי אוספים ספלים. בטיול בברצלונה התאהבנו בשני ספלים באחד מהבתי קפה שהיינו בהם, אבל אי אפשר היה לקנות אותם. אז בלי שאף אחד שם לב,שטפתי אותם בשירותים ולקחתי אותם איתנו בתיק.",
    country: "ספרד",
    topic: "גניבה",
    tags: ["גניבה", "ספרד"],
    imageUrl: "/images/ill-cafe.png",
    createdAt: "2026-06-01T17:40:00+03:00",
    averageScore: 85,
    ratingsCount: 12,
  },
  {
    seedKey: "shoes",
    title: "נעליים",
    content:
      "בדירה ששכרתי בחו״ל ביקשו לא להיכנס עם נעליים כדי לא להפריע לעסק שמתחת. נכנסתי איתן בכל זאת, גם כי חששתי שייגנבו אם אשאיר אותן בחוץ וגם כי לא ייחסתי חשיבות לבקשה. באותו רגע הרגשתי כעס על הדרישה, ולא הרגשתי אשמה אחר כך",
    country: "אחר",
    topic: "אחר",
    tags: ["אחר"],
    imageUrl: "/images/ill-flipflops.png",
    createdAt: "2026-06-03T13:00:00+03:00",
    averageScore: 40,
    ratingsCount: 5,
  },
  {
    seedKey: "train",
    title: "הרכבת",
    content:
      "הייתי בגרמניה ונסעתי ברכבת התחתית .לא ידעתי איך לקנות כרטיס במכונה . ביקשתי עזרה מאנשים אך זה לא הסתדר ומפה לשם נסעתי ללא תשלום לזמן לא מבוטל מהחופשה... אחרי כמה ימים קניתי כרטיסי כי כבר הרגשתי לא נעים.",
    country: "גרמניה",
    topic: "גניבה",
    tags: ["גרמניה", "גניבה"],
    imageUrl: "/images/ill-hostel.png",
    createdAt: "2026-06-03T15:20:00+03:00",
    averageScore: 75,
    ratingsCount: 9,
  },
  {
    seedKey: "honeymoon",
    title: "ירח דבש",
    content:
      "כל פעם שאני ואשתי טסים לחו״ל ובעיקר למזרח אנחנו משקרים שזה הירח דבש שלנו, גם שאנחנו כמה שנים טובות אחרי החתונה. אנחנו תמיד מקבלים הרבה הטבות בזכות זה כמו סוויטות משודרגות חינם ובקבוקי שמפנייה לחדר",
    country: "תאילנד",
    topic: "קומבינה",
    tags: ["תאילנד", "קומבינה"],
    imageUrl: "/images/ill-beach.png",
    createdAt: "2026-06-05T12:35:00+03:00",
    averageScore: 60,
    ratingsCount: 11,
  },
  {
    seedKey: "marathon",
    title: "מרתון",
    content: "עקפתי בתור ענק בפארק בארה״ב כי הייתי בלחץ של זמן. היה קצת לא נעים אבל התגברתי.",
    country: "ארה״ב",
    topic: "תור",
    tags: ["ארה״ב", "תור"],
    imageUrl: "/images/ill-marathon.png",
    createdAt: "2026-06-08T13:10:00+03:00",
    averageScore: 30,
    ratingsCount: 3,
  },
  {
    seedKey: "gozleme",
    title: "גוזלמה",
    content:
      "כשהייתי קטנה הייתי במלון הכל כלול בתורכיה, היה שם בבופה של הארוחת בוקר מאכל תורכי בשם גוזלמה, תמיד היה אליו תור ענק ולי ולאחים שלי נמאס אז שיחקנו אותה שאנחנו לא רואים שיש תור והשתחלנו להתחלה. לא הרגשתי רע מידי.",
    country: "תורכיה",
    topic: "קומבינה",
    tags: ["תורכיה", "תור", "קומבינה"],
    imageUrl: "/images/ill-tour.png",
    createdAt: "2026-06-11T10:00:00+03:00",
    averageScore: 70,
    ratingsCount: 7,
  },
  {
    seedKey: "budget-room",
    title: "חדר חסכוני",
    content:
      "בטיול הגדול אמרנו שאנחנו ארבעה בחדר ובסוף הבאנו מזרונים והיינו יותר, המטרה הייתה לחסוך בכסף. באותו רגע הרגשתי עם זה די בסדר- עכשיו קצת פחות",
    country: "טיול גדול",
    topic: "קומבינה",
    tags: ["טיול גדול", "קומבינה"],
    imageUrl: "/images/ill-dorm.png",
    createdAt: "2026-06-20T20:10:00+03:00",
    averageScore: 60,
    ratingsCount: 6,
  },
];

async function createSchema() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS confessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      seed_key text UNIQUE,
      title text NOT NULL,
      content text NOT NULL,
      country text,
      topic text,
      tags text[] NOT NULL DEFAULT '{}',
      image_url text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      ratings_count integer NOT NULL DEFAULT 0 CHECK (ratings_count >= 0),
      ratings_sum integer NOT NULL DEFAULT 0 CHECK (ratings_sum >= 0),
      status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden')),
      CONSTRAINT tags_limit CHECK (cardinality(tags) <= 3)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS confession_drafts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt text NOT NULL,
      generated_title text NOT NULL,
      generated_content text NOT NULL,
      country text,
      topic text,
      generated_tags text[] NOT NULL DEFAULT '{}',
      image_options text[] NOT NULL DEFAULT '{}',
      selected_image_url text,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT generated_tags_limit CHECK (cardinality(generated_tags) <= 3),
      CONSTRAINT image_options_count CHECK (cardinality(image_options) <= 2)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS images (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      data bytea NOT NULL,
      content_type text NOT NULL DEFAULT 'image/png',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ratings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      confession_id uuid NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
      score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
      client_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (confession_id, client_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS confessions_created_at_idx ON confessions (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS confessions_status_idx ON confessions (status)`;
  await sql`CREATE INDEX IF NOT EXISTS confessions_country_idx ON confessions (country)`;
  await sql`CREATE INDEX IF NOT EXISTS confessions_topic_idx ON confessions (topic)`;
  await sql`CREATE INDEX IF NOT EXISTS confessions_tags_idx ON confessions USING gin (tags)`;
}

async function seedInitialConfessions() {
  for (const item of seedConfessions) {
    const ratingsSum = item.averageScore * item.ratingsCount;

    await sql`
      INSERT INTO confessions (
        seed_key,
        title,
        content,
        country,
        topic,
        tags,
        image_url,
        created_at,
        ratings_count,
        ratings_sum,
        status
      )
      VALUES (
        ${item.seedKey},
        ${item.title},
        ${item.content},
        ${item.country},
        ${item.topic},
        ${item.tags},
        ${item.imageUrl},
        ${item.createdAt},
        ${item.ratingsCount},
        ${ratingsSum},
        'published'
      )
      ON CONFLICT (seed_key) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        country = EXCLUDED.country,
        topic = EXCLUDED.topic,
        tags = EXCLUDED.tags,
        image_url = EXCLUDED.image_url,
        created_at = EXCLUDED.created_at,
        ratings_count = EXCLUDED.ratings_count,
        ratings_sum = EXCLUDED.ratings_sum,
        status = EXCLUDED.status
    `;
  }
}

async function main() {
  await createSchema();
  await seedInitialConfessions();
  await sql`
    INSERT INTO schema_migrations (name)
    VALUES (${migrationName})
    ON CONFLICT (name) DO UPDATE SET applied_at = now()
  `;

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM confessions WHERE status = 'published'`;
  console.log(`Migration complete. Published confessions: ${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
