export const imagePaths = {
  beach: "/images/ill-beach.png",
  cafe: "/images/ill-cafe.png",
  dorm: "/images/ill-dorm.png",
  flipflops: "/images/ill-flipflops.png",
  hostel: "/images/ill-hostel.png",
  marathon: "/images/ill-marathon.png",
  passport: "/images/ill-passport.png",
  tour: "/images/ill-tour.png",
  waterpark: "/images/ill-waterpark.png",
} as const;

export type SortValue = "random" | "newest" | "oldest" | "most-chutzpah" | "most-polite";

export type Confession = {
  id: string;
  title: string;
  date: string;
  createdAt: string;
  timestamp: number;
  content: string;
  country: string;
  topic: string;
  tags: string[];
  image: string;
  averageScore: number;
  ratingsCount: number;
};

export type ConfessionDraft = {
  id: string;
  prompt: string;
  title: string;
  content: string;
  country: string;
  topic: string;
  tags: string[];
  imageOptions: string[];
  createdAt: string;
};

export const sortLabels: Record<SortValue, string> = {
  random: "אקראי",
  newest: "הכי חדש",
  oldest: "הכי ישן",
  "most-chutzpah": "הכי חצוף",
  "most-polite": "הכי מנומס",
};
