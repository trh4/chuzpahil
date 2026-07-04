"use client";

import Image from "next/image";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import {
  type Confession,
  type ConfessionDraft,
  type SortValue,
  imagePaths,
  sortLabels,
} from "./lib/confessions";

const images = {
  arrow: "/images/arrow-back.svg",
  beach: imagePaths.beach,
  cafe: imagePaths.cafe,
  discoverTune: "/images/discover-tune.svg",
  dorm: imagePaths.dorm,
  flipflops: imagePaths.flipflops,
  hostel: imagePaths.hostel,
  logo: "/images/logo-chutzpah.svg",
  loadingCroissants: "/images/loading-croissants.png",
  loadingSuitcase: "/images/loading-suitcase.png",
  marathon: imagePaths.marathon,
  menuBook: "/images/menu-book.svg",
  passport: imagePaths.passport,
  search: "/images/search-icon.svg",
  searchMobile: "/images/search-icon-mobile.svg",
  tour: imagePaths.tour,
  waterpark: imagePaths.waterpark,
} as const;

type CollageImage = {
  src: string;
  alt: string;
  confessionId?: string;
  /** Absolute position (% of the page) + width (vw), fully fluid. */
  className: string;
  rotate: string;
  priority?: boolean;
};

// Positions are percentages of the page, sizes are relative to the viewport
// width, so the collage scales continuously with any screen size.
const mobileCollage: CollageImage[] = [
  {
    src: images.cafe,
    alt: "Illustration of travelers at a cafe",
    confessionId: "souvenir-mugs",
    className: "left-[-15%] top-[3%] w-[68vw]",
    rotate: "-rotate-[16.43deg]",
    priority: true,
  },
  {
    src: images.waterpark,
    alt: "Illustration of a water park scene",
    confessionId: "bracelet",
    className: "left-[60%] top-[3%] w-[67vw]",
    rotate: "rotate-[20.07deg]",
    priority: true,
  },
  {
    src: images.hostel,
    alt: "Illustration of a masked tourist",
    confessionId: "train",
    className: "left-[-15%] top-[27%] w-[38vw]",
    rotate: "-rotate-[31.18deg]",
  },
  {
    src: images.flipflops,
    alt: "Illustration of a traveler on red hoverboards",
    confessionId: "honeymoon",
    className: "left-[72%] top-[30%] w-[41vw]",
    rotate: "-rotate-[17.95deg]",
  },
  {
    src: images.dorm,
    alt: "Illustration of travelers sleeping in a shared room",
    confessionId: "budget-room",
    className: "left-[-26%] top-[45%] w-[55vw]",
    rotate: "-rotate-[12.83deg]",
  },
  {
    src: images.beach,
    alt: "Illustration of tourists on a beach",
    confessionId: "honeymoon",
    className: "left-[54%] top-[56%] w-[91vw]",
    rotate: "rotate-[13.47deg]",
  },
  {
    src: images.marathon,
    alt: "Illustration of a runner abroad",
    confessionId: "marathon",
    className: "left-[-37%] top-[64%] w-[84vw]",
    rotate: "rotate-[21.36deg]",
  },
  {
    src: images.tour,
    alt: "Illustration of a tour group",
    confessionId: "gozleme",
    className: "left-[46%] top-[84%] w-[44vw]",
    rotate: "-rotate-[20.55deg]",
  },
];

const desktopCollage: CollageImage[] = [
  {
    src: images.cafe,
    alt: "Illustration of travelers at a cafe",
    confessionId: "souvenir-mugs",
    className: "left-[7%] top-[8%] w-[30vw]",
    rotate: "rotate-[11.58deg]",
    priority: true,
  },
  {
    src: images.flipflops,
    alt: "Illustration of a traveler on red hoverboards",
    confessionId: "honeymoon",
    className: "left-[55%] top-[19%] w-[17.5vw]",
    rotate: "rotate-[25.36deg]",
  },
  {
    src: images.waterpark,
    alt: "Illustration of a water park scene",
    confessionId: "bracelet",
    className: "left-[64%] top-[4%] w-[34.5vw]",
    rotate: "-rotate-[9.89deg]",
    priority: true,
  },
  {
    src: images.hostel,
    alt: "Illustration of a masked tourist",
    confessionId: "train",
    className: "left-[-3%] top-[23%] w-[18.5vw]",
    rotate: "-rotate-[19.05deg]",
  },
  {
    src: images.marathon,
    alt: "Illustration of a runner abroad",
    confessionId: "marathon",
    className: "left-[82.5%] top-[86%] w-[17.5vw]",
    rotate: "-rotate-[15deg]",
  },
  {
    src: images.beach,
    alt: "Illustration of tourists on a beach",
    confessionId: "honeymoon",
    className: "left-[61%] top-[63%] w-[32vw]",
    rotate: "rotate-[13.47deg]",
  },
  {
    src: images.dorm,
    alt: "Illustration of travelers sleeping in a shared room",
    confessionId: "budget-room",
    className: "left-[2%] top-[65%] w-[34vw]",
    rotate: "-rotate-[12.83deg]",
  },
  {
    src: images.tour,
    alt: "Illustration of a tour group",
    confessionId: "gozleme",
    className: "left-[50.5%] top-[86%] w-[21vw]",
    rotate: "rotate-[8.85deg]",
  },
];

function FloatingIllustration({
  src,
  alt,
  className,
  rotate,
  priority,
  faded,
  onClick,
}: CollageImage & {
  faded?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div
      className={`relative aspect-square w-[81%] overflow-hidden shadow-[0.9vw_1vw_0.7vw_-0.3vw_rgba(0,0,0,0.25)] ${rotate} ${faded ? "opacity-50" : ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 35vw, 90vw"
        className="object-cover"
      />
    </div>
  );

  return (
    <div
      className={`absolute flex aspect-square items-center justify-center transition-transform duration-300 ease-out hover:z-20 hover:scale-110 ${className}`}
    >
      {onClick ? (
        <button type="button" onClick={onClick} className="flex size-full cursor-pointer items-center justify-center">
          {content}
        </button>
      ) : (
        content
      )}
    </div>
  );
}

function Header({
  search,
  country,
  topic,
  sort,
  countries,
  topics,
  onSearchChange,
  onCountryChange,
  onTopicChange,
  onSortChange,
}: {
  search: string;
  country: string;
  topic: string;
  sort: SortValue;
  countries: string[];
  topics: string[];
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onSortChange: (value: SortValue) => void;
}) {
  const filterClass = (active: boolean) =>
    `rounded-full border px-2 py-0.5 font-sans text-[14px] lg:px-[clamp(12px,0.75vw,18px)] lg:py-[clamp(4px,0.35vw,7px)] lg:text-[clamp(18px,1.25vw,24px)] ${
      active ? "border-[blue] bg-[#d1e2ff] text-[blue]" : "border-[#998e8a] text-[#745447]"
    }`;

  return (
    <header
      className="relative z-30 flex h-[clamp(50px,6.5vw,83px)] w-full items-center justify-between overflow-clip border-b border-[#eae5e3] bg-[#fffaf0] px-[clamp(18px,7.2vw,92px)] py-[clamp(10px,1.1vw,13px)]"
      dir="ltr"
    >
      <label
        className="flex min-w-0 items-center justify-center rounded-full p-[6px] lg:w-[clamp(290px,29.5vw,567px)] lg:justify-between lg:border lg:border-[#998e8a] lg:px-[clamp(15px,1.2vw,22px)] lg:py-[clamp(6px,0.55vw,10px)]"
      >
        <span className="relative h-[12px] w-[10px] shrink-0 lg:h-[clamp(18px,1.15vw,22px)] lg:w-[clamp(15px,1vw,19px)]">
          <Image
            src={images.searchMobile}
            alt=""
            fill
            className="object-contain lg:hidden"
            sizes="10px"
          />
          <Image
            src={images.search}
            alt=""
            fill
            className="hidden object-contain lg:block"
            sizes="19px"
          />
        </span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="חיפוש חופשי"
          dir="rtl"
          className="hidden min-w-0 flex-1 bg-transparent text-right font-sans text-[clamp(18px,1.25vw,24px)] text-[#745447] placeholder:text-[#745447] focus:outline-none lg:block"
        />
      </label>

      <nav className="flex min-w-0 items-center justify-end gap-[clamp(18px,4.9vw,63px)]" dir="rtl">
        <label className="flex shrink-0 items-center justify-center gap-1 text-[#0013be] lg:gap-[clamp(6px,0.45vw,8.269px)]">
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortValue)}
            className="cursor-pointer appearance-none bg-transparent font-sans text-[14px] text-[#0013be] focus:outline-none lg:text-[clamp(16px,1.25vw,24px)]"
            aria-label="Sort confessions"
          >
            {(Object.keys(sortLabels) as SortValue[]).map((value) => (
              <option key={value} value={value}>
                {sortLabels[value]}
              </option>
            ))}
          </select>
          <span className="relative h-2 w-1 -rotate-90 lg:h-[clamp(11px,0.76vw,14.603px)] lg:w-[clamp(6px,0.45vw,8.598px)]">
            <Image src={images.arrow} alt="" fill sizes="15px" />
          </span>
        </label>

        <div className="flex min-w-0 items-center gap-[5px]">
          <span className="relative size-[14px] shrink-0 lg:size-[clamp(16px,1.3vw,24.873px)]">
            <Image src={images.discoverTune} alt="" fill sizes="25px" />
          </span>
          <div className="flex items-center gap-1.5 lg:gap-[clamp(10px,0.75vw,14px)]">
            <select
              value={country}
              onChange={(event) => onCountryChange(event.target.value)}
              className={filterClass(Boolean(country))}
              aria-label="Filter by country"
            >
              <option value="">מדינה</option>
              {countries.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              value={topic}
              onChange={(event) => onTopicChange(event.target.value)}
              className={filterClass(Boolean(topic))}
              aria-label="Filter by topic"
            >
              <option value="">נושא</option>
              {topics.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </nav>
    </header>
  );
}

function HeroContent({
  prompt,
  error,
  onPromptChange,
  onSubmit,
  onHelp,
}: {
  prompt: string;
  error?: string;
  onPromptChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onHelp: () => void;
}) {
  return (
    <section className="relative z-20 mx-auto mt-[clamp(140px,26dvh,340px)] flex w-full max-w-[1046px] flex-col items-center gap-[clamp(9px,1.2vw,20px)] px-5">
      <div className="flex w-full flex-col items-center gap-[clamp(14px,1.5vw,28px)]">
        <div className="flex flex-col items-center">
          <div className="relative aspect-482/196 w-[clamp(186px,25vw,482px)]">
            <Image src={images.logo} alt="Chutzpah" fill priority sizes="(min-width: 1024px) 482px, 190px" />
          </div>
          <p className="font-ploni-yad mt-[-0.05em] text-center text-[clamp(50px,6.7vw,128px)] leading-none text-[#2b2b2b]">
            איי.אל
          </p>
        </div>

        <p className="max-w-[min(60vw,700px)] text-center text-[clamp(14px,1.35vw,26px)] leading-[1.16] text-[#2b2b2b]">
          ווידויים של ישראלים בחו״ל שהם רמה גבוהה של רמה נמוכה
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-[min(92vw,1046px)] items-center justify-end overflow-hidden rounded-full border-2 border-[blue] bg-[#fffcf8] px-[clamp(16px,2vw,40px)] py-[clamp(7px,0.75vw,14.5px)] shadow-[6px_4px_10.2px_0px_rgba(0,0,255,0.25),70px_15px_43px_0px_rgba(0,0,0,0.05),31px_7px_32px_0px_rgba(0,0,0,0.09),8px_2px_17px_0px_rgba(0,0,0,0.1)]"
      >
        <span className="flex w-full items-center gap-[clamp(7px,1.3vw,26px)]">
          <button
            type="button"
            onClick={onHelp}
            className="relative size-[clamp(24px,2.3vw,45px)] shrink-0"
            aria-label="Prompt writing instructions"
          >
            <Image src={images.menuBook} alt="" fill sizes="45px" />
          </button>
          <input
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="לא להתבייש! כתבו על סיטואציה בה הייתם קצת הישראלי המכוער בחול...."
            dir="rtl"
            className="min-w-0 flex-1 overflow-hidden bg-transparent text-right font-sans text-[clamp(14px,1.25vw,24px)] text-ellipsis whitespace-nowrap text-[#2b2b2b] placeholder:text-[#998e8a] focus:outline-none"
          />
        </span>
      </form>
      {error ? (
        <p className="max-w-[290px] text-center text-[12px] leading-snug text-[blue] lg:max-w-none lg:text-[14px]">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function Collage({
  items,
  faded = false,
  onOpenDetail,
}: {
  items: CollageImage[];
  faded?: boolean;
  onOpenDetail?: (id: string) => void;
}) {
  return (
    <>
      {items.map((item) => (
        <FloatingIllustration
          key={`${item.src}-${item.className}`}
          {...item}
          faded={faded}
          onClick={
            onOpenDetail
              ? () => {
                  if (item.confessionId) {
                    onOpenDetail(item.confessionId);
                  }
                }
              : undefined
          }
        />
      ))}
    </>
  );
}

function collageItemsForConfessions(layout: CollageImage[], confessions: Confession[]) {
  return confessions.slice(0, layout.length).map((confession, index) => ({
    ...layout[index],
    src: confession.image,
    alt: confession.title,
    confessionId: confession.id,
  }));
}

function NewConfessionIllustration({ confession }: { confession: Confession }) {
  return (
    <div className="absolute left-[5%] top-[42%] z-10 flex aspect-square w-[64vw] animate-[passportIn_500ms_ease-out] items-center justify-center lg:left-[18%] lg:top-[58%] lg:w-[24.5vw]">
      <div className="relative aspect-square w-[81%] rotate-[-15.76deg] overflow-hidden shadow-[0.9vw_1vw_0.7vw_-0.3vw_rgba(0,0,0,0.25)]">
        <Image src={confession.image} alt={confession.title} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 64vw" />
      </div>
    </div>
  );
}

type Screen = "home" | "detail" | "generating" | "preview" | "saving" | "success";

function uniqueValues(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean);
}

function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      className="absolute left-1/2 top-[129px] z-40 flex -translate-x-1/2 flex-col items-center justify-center gap-[10px] rounded-[13.127px] border-2 border-[#8cc63f] bg-[#f7ffec] p-[30px] text-center drop-shadow-[128px_74px_20.5px_rgba(0,0,0,0),82px_47px_19px_rgba(0,0,0,0.01),46px_27px_16px_rgba(0,0,0,0.05),21px_12px_12px_rgba(0,0,0,0.09),5px_3px_6.5px_rgba(0,0,0,0.1)] lg:top-[136px] lg:w-[420px] 2xl:top-[160px] 2xl:w-[540px]"
    >
      <span className="font-haim w-[106px] text-[26px] text-[#61a605] lg:w-auto lg:text-[34px] 2xl:text-[46px]">היידה!</span>
      <span className="w-[182px] text-[14px] text-[#2b2b2b] lg:w-auto lg:text-[18px] 2xl:text-[24px]">הוידוי שלך נוסף למאגר בהצלחה</span>
    </button>
  );
}

function Backdrop({ onClick }: { onClick?: () => void }) {
  return (
    <>
      <div className="absolute inset-0 lg:hidden">
        <Collage items={mobileCollage} faded />
      </div>
      <div className="absolute inset-0 hidden lg:block">
        <Collage items={desktopCollage} faded />
      </div>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="absolute inset-0 z-10 bg-[rgba(255,250,240,0.8)] backdrop-blur-[3.15px]"
          aria-label="Close confession"
        />
      ) : (
        <div className="absolute inset-0 z-10 bg-[rgba(255,250,240,0.8)] backdrop-blur-[3.15px]" />
      )}
    </>
  );
}

function ScreenCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full flex-1 overflow-hidden bg-[#fffaf0] font-sans text-[#2b2b2b]" dir="rtl">
      {children}
    </div>
  );
}

function TagPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#998e8a] px-2 py-0.5 font-sans text-[14px] text-[#745447]">
      {children}
    </span>
  );
}

function ConfessionCard({
  mode,
  confession,
  imageOptions,
  rating,
  actionError,
  flashRating,
  onRatingChange,
  onClose,
  onCancel,
  onPublish,
}: {
  mode: "detail" | "preview";
  confession: Confession;
  imageOptions?: string[];
  rating?: number;
  actionError?: string;
  flashRating?: number;
  onRatingChange?: (value: number) => void;
  onClose?: () => void;
  onCancel?: () => void;
  onPublish?: (selectedImageUrl: string) => void;
}) {
  const isPreview = mode === "preview";
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const previewImages = imageOptions?.length ? imageOptions : [confession.image];
  const image = isPreview ? previewImages[previewImageIndex] : confession.image;

  return (
    <div
      className={
        isPreview
          ? "absolute left-1/2 top-[80px] z-20 flex w-[342px] -translate-x-1/2 flex-col items-center gap-[22px] lg:top-1/2 lg:w-[1010px] lg:-translate-y-1/2 2xl:w-[1390px]"
          : "absolute left-1/2 top-[55px] z-20 flex w-[342px] -translate-x-1/2 flex-col items-center gap-[16px] lg:top-1/2 lg:w-[1010px] lg:-translate-y-1/2 2xl:w-[1390px]"
      }
    >
      <article className="flex w-full flex-col items-center bg-[#fffcf8] pb-5 text-right drop-shadow-[4px_4px_3.3px_rgba(0,0,0,0.25)] lg:min-h-[500px] lg:flex-row lg:items-stretch lg:justify-center lg:pb-0 2xl:min-h-[720px]">
        <div
          className={`relative h-[364px] w-full overflow-hidden lg:h-auto lg:w-[500px] 2xl:w-[720px] ${isPreview ? "ring-4 ring-[blue]" : ""}`}
        >
          <Image src={image} alt={confession.title} fill priority className="object-cover" sizes="342px" />
          {flashRating !== undefined ? (
            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-6 py-3 text-[34px] font-bold text-[blue] shadow-[3px_3px_18px_rgba(0,0,0,0.25)]">
              {flashRating}%
            </div>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-[14px] top-[10px] text-[30px] leading-none text-white"
            aria-label="Close"
          >
            ×
          </button>
          {isPreview ? (
            <>
              <div className="absolute inset-x-0 bottom-0 h-[76px] bg-linear-to-b from-transparent to-[rgba(0,0,0,0.7)]" />
              <div className="absolute bottom-[17px] left-1/2 flex -translate-x-1/2 items-center gap-[108px] text-[34px] leading-none text-white">
                <button
                  type="button"
                  onClick={() => setPreviewImageIndex((value) => (value + previewImages.length - 1) % previewImages.length)}
                  aria-label="Previous preview image"
                >
                  →
                </button>
                <span className="text-[24px]">
                  {previewImageIndex + 1}/{previewImages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImageIndex((value) => (value + 1) % previewImages.length)}
                  aria-label="Next preview image"
                >
                  ←
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-5 flex w-[292px] flex-col items-end gap-4 lg:m-0 lg:w-[430px] lg:justify-center lg:p-10 2xl:w-[560px] 2xl:p-16">
          <div className="flex w-full flex-col items-end gap-[13px]">
            <div className="flex w-full flex-col items-end gap-1.5">
              {isPreview ? <p className="text-[14px] text-[blue]">* תצוגה לפני פרסום</p> : null}
              <div className="flex w-full flex-col items-end gap-0.5">
                <h1 className="font-haim text-[26px] leading-none text-[blue] lg:text-[46px] 2xl:text-[64px]">{confession.title}</h1>
                <p className="text-[14px] text-[#998e8a] lg:text-[18px] 2xl:text-[24px]">{confession.date}</p>
              </div>
            </div>
            <p className="w-full text-[14px] leading-[1.296] text-[#2b2b2b] lg:text-[18px] 2xl:text-[24px]">{confession.content}</p>
            {!isPreview ? (
              <p className="w-full text-[14px] lg:text-[18px] 2xl:text-[24px]">
                <span className="text-[#998e8a]">דירוג חוצפמטר ממוצע:</span>{" "}
                <span className="text-[#2b2b2b]">{confession.averageScore}%</span>
              </p>
            ) : null}
          </div>
          <div className="flex w-full items-center justify-end gap-2">
            {confession.tags.map((tag) => (
              <TagPill key={tag}>{tag}</TagPill>
            ))}
          </div>
        </div>
      </article>

      {isPreview ? (
        <div className="flex items-center gap-[10px] lg:mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#998e8a] px-[18px] py-[5px] text-[20px] text-[#2b2b2b]"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={() => onPublish?.(image)}
            className="flex w-[101px] items-center justify-center gap-[6px] rounded-[50.116px] bg-[blue] px-5 py-[5px] text-[20px] font-semibold text-[#fffcf8]"
          >
            פרסום ↑
          </button>
          {actionError ? <p className="max-w-[300px] text-right text-[14px] text-[blue]">{actionError}</p> : null}
        </div>
      ) : (
        <div className="flex w-[296px] flex-col items-end justify-center lg:w-[760px] 2xl:w-[1040px]">
          <p className="w-full text-right text-[14px] font-bold lg:text-[20px] 2xl:text-[26px]">דרג.י בחוצפמטר:</p>
          <div className="relative h-[63px] w-full lg:h-[82px]">
            <span className="absolute left-0 top-1 rounded-[5px] bg-[#fffcf8] px-2 text-[14px] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.25)]">
              {rating ?? 0}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={rating ?? 0}
              onChange={(event) => onRatingChange?.(Number(event.target.value))}
              className="absolute left-0 top-[33px] h-5 w-full accent-[blue] lg:top-[45px]"
              aria-label="Chutzpah meter"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingImageScreen({ src }: { src: string }) {
  const isSuitcase = src === images.loadingSuitcase;

  return (
    <ScreenCanvas>
      <div className="absolute left-1/2 top-0 h-[844px] w-[390px] -translate-x-1/2 lg:hidden">
        <Image src={src} alt="" fill priority className="object-cover" sizes="390px" />
      </div>
      <div className="hidden lg:block">
        <Backdrop />
        <div className="absolute left-1/2 top-1/2 z-20 flex h-[596px] w-[680px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-5 bg-[#fffcf8] pb-5 drop-shadow-[4px_4px_3.3px_rgba(0,0,0,0.25)] 2xl:h-[903px] 2xl:w-[1392px]">
          <div className="flex h-[296px] w-[360px] items-center justify-center 2xl:h-[460px] 2xl:w-[620px]">
            <div className="text-[150px] leading-none 2xl:text-[230px]">{isSuitcase ? "🧳" : "🥐"}</div>
          </div>
          <p className="text-center text-[20px] text-[#2b2b2b] 2xl:text-[30px]">
            {isSuitcase ? "מוסיף את הוידוי שלך..." : "מעמיס רגע כמה נתונים"}
          </p>
        </div>
      </div>
    </ScreenCanvas>
  );
}

function Modal({
  title,
  children,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(255,250,240,0.72)] px-6 backdrop-blur-sm">
      <div className="flex w-[330px] flex-col items-center gap-4 rounded-[18px] border border-[#998e8a] bg-[#fffcf8] p-6 text-center shadow-[6px_6px_20px_rgba(0,0,0,0.18)]">
        <h2 className="font-haim text-[24px] text-[blue]">{title}</h2>
        <div className="text-[14px] leading-[1.45] text-[#2b2b2b]">{children}</div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-[#998e8a] px-5 py-1.5">
            חזרה
          </button>
          {onConfirm ? (
            <button type="button" onClick={onConfirm} className="rounded-full bg-[blue] px-5 py-1.5 text-[#fffcf8]">
              אישור
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute left-1/2 top-[65%] z-30 flex -translate-x-1/2 flex-col items-center gap-3 rounded-[18px] border border-[#998e8a] bg-[#fffcf8]/95 px-6 py-5 text-center shadow-[6px_6px_18px_rgba(0,0,0,0.15)]">
      <p className="text-[16px] text-[#2b2b2b]">לא נמצאו וידויים מתאימים</p>
      <button type="button" onClick={onReset} className="rounded-full bg-[blue] px-5 py-1.5 text-[14px] text-[#fffcf8]">
        איפוס סינון
      </button>
    </div>
  );
}

function InstructionsCard() {
  return (
    <div className="absolute left-1/2 top-[60%] z-30 flex w-[min(92vw,640px)] -translate-x-1/2 flex-col gap-[clamp(12px,1vw,20px)] rounded-[clamp(18px,1.4vw,26px)] bg-[#fffcf8] p-[clamp(20px,1.7vw,32px)] text-right shadow-[4px_4px_12px_rgba(0,0,0,0.18)]">
      <h2 className="font-haim text-[22px] text-[blue] lg:text-[28px]">איך לכתוב וידוי טוב?</h2>
      {[
        ["✓", "ספרו איפה זה קרה ובאיזו מדינה"],
        ["✓", "תארו מה עשיתם או מה ראיתם בפועל"],
        ["!", "הוסיפו מי היה מעורב ומה הייתה הסיטואציה"],
        ["×", "אל תסתפקו במשפט קצר מדי"],
      ].map(([icon, text]) => (
        <p key={text} className="flex items-center justify-end gap-3 text-[14px] text-[#2b2b2b] lg:text-[18px]">
          <span>{text}</span>
          <span className="flex size-6 items-center justify-center rounded-full border border-[blue] text-[blue]">{icon}</span>
        </p>
      ))}
    </div>
  );
}

function HomeScreen({
  prompt,
  error,
  search,
  country,
  topic,
  sort,
  countries,
  topics,
  visibleConfessions,
  hasNoResults,
  showSuccess,
  newConfession,
  showInstructions,
  onPromptChange,
  onSubmit,
  onHelp,
  onOpenDetail,
  onDismissSuccess,
  onSearchChange,
  onCountryChange,
  onTopicChange,
  onSortChange,
  onResetFilters,
}: {
  prompt: string;
  error?: string;
  search: string;
  country: string;
  topic: string;
  sort: SortValue;
  countries: string[];
  topics: string[];
  visibleConfessions: Confession[];
  hasNoResults: boolean;
  showSuccess?: boolean;
  newConfession?: Confession;
  showInstructions?: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onHelp: () => void;
  onOpenDetail: (id: string) => void;
  onDismissSuccess: () => void;
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onSortChange: (value: SortValue) => void;
  onResetFilters: () => void;
}) {
  const mobileItems = collageItemsForConfessions(mobileCollage, visibleConfessions);
  const desktopItems = collageItemsForConfessions(desktopCollage, visibleConfessions);

  function renderHeader() {
    return (
      <Header
        search={search}
        country={country}
        topic={topic}
        sort={sort}
        countries={countries}
        topics={topics}
        onSearchChange={onSearchChange}
        onCountryChange={onCountryChange}
        onTopicChange={onTopicChange}
        onSortChange={onSortChange}
      />
    );
  }

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col overflow-x-clip bg-[#fffaf0] font-sans text-[#2b2b2b]"
      dir="rtl"
    >
      {renderHeader()}
      <main className="relative w-full flex-1 overflow-hidden" aria-label="Homepage hero">
        <div className="absolute inset-0 lg:hidden">
          <Collage items={mobileItems} onOpenDetail={onOpenDetail} />
        </div>
        <div className="absolute inset-0 hidden lg:block">
          <Collage items={desktopItems} onOpenDetail={onOpenDetail} />
        </div>
        {newConfession ? <NewConfessionIllustration confession={newConfession} /> : null}
        <HeroContent
          prompt={prompt}
          error={error}
          onPromptChange={onPromptChange}
          onSubmit={onSubmit}
          onHelp={onHelp}
        />
        {showInstructions ? <InstructionsCard /> : null}
        {showSuccess ? <SuccessToast onDismiss={onDismissSuccess} /> : null}
        {hasNoResults ? <EmptyState onReset={onResetFilters} /> : null}
      </main>
    </div>
  );
}

async function responseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

function draftToConfession(draft: ConfessionDraft): Confession {
  return {
    id: draft.id,
    title: draft.title,
    date: "תצוגה לפני פרסום",
    createdAt: draft.createdAt,
    timestamp: new Date(draft.createdAt).getTime(),
    content: draft.content,
    country: draft.country,
    topic: draft.topic,
    tags: draft.tags,
    image: draft.imageOptions[0] ?? images.passport,
    averageScore: 0,
    ratingsCount: 0,
  };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [selectedConfessionId, setSelectedConfessionId] = useState("");
  const [draft, setDraft] = useState<ConfessionDraft>();
  const [newConfession, setNewConfession] = useState<Confession>();
  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [loadError, setLoadError] = useState<string>();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [topic, setTopic] = useState("");
  const [sort, setSort] = useState<SortValue>("random");
  const [rating, setRating] = useState(0);
  const [flashRating, setFlashRating] = useState<number>();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const visibleConfessions = confessions;
  const countries = uniqueValues(confessions.map((item) => item.country));
  const topics = uniqueValues(confessions.map((item) => item.topic));
  const selectedConfession = confessions.find((item) => item.id === selectedConfessionId);
  const previewConfession = draft ? draftToConfession(draft) : undefined;

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(
      async () => {
        const params = new URLSearchParams();
        if (search.trim()) {
          params.set("search", search.trim());
        }
        if (country) {
          params.set("country", country);
        }
        if (topic) {
          params.set("topic", topic);
        }
        params.set("sort", sort);

        try {
          const response = await fetch(`/api/confessions?${params.toString()}`, {
            cache: "no-store",
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(await responseError(response));
          }

          const body = (await response.json()) as { confessions: Confession[] };
          setConfessions(body.confessions);
          setSelectedConfessionId((current) =>
            current && body.confessions.some((item) => item.id === current) ? current : body.confessions[0]?.id ?? "",
          );
          setLoadError(undefined);
        } catch (error) {
          if (!controller.signal.aborted) {
            setLoadError(error instanceof Error ? error.message : "Failed to load confessions");
          }
        } finally {
          if (!controller.signal.aborted) {
            setHasLoaded(true);
          }
        }
      },
      search.trim() ? 250 : 0,
    );

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [country, search, sort, topic]);

  useEffect(() => {
    if (!showSuccessToast) {
      return;
    }

    const timer = window.setTimeout(() => setShowSuccessToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showSuccessToast]);

  async function handlePromptSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length < 12) {
      setPromptError("הוידוי קצר מדי. הוסיפו איפה זה קרה, מה קרה בפועל ולמה זו חוצפה.");
      return;
    }

    setPromptError(undefined);
    setActionError(undefined);
    setShowInstructions(false);
    setScreen("generating");

    try {
      const response = await fetch("/api/confessions/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      if (!response.ok) {
        throw new Error(await responseError(response));
      }

      const body = (await response.json()) as { draft: ConfessionDraft };
      setDraft(body.draft);
      setScreen("preview");
    } catch (error) {
      setScreen("home");
      setPromptError(error instanceof Error ? error.message : "יצירת הוידוי נכשלה. נסו שוב.");
    }
  }

  async function handlePublish(selectedImageUrl: string) {
    if (!draft) {
      return;
    }

    setActionError(undefined);
    setScreen("saving");

    try {
      const response = await fetch(`/api/confessions/draft/${draft.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedImageUrl }),
      });

      if (!response.ok) {
        throw new Error(await responseError(response));
      }

      const body = (await response.json()) as { confession: Confession };
      setConfessions((items) => [body.confession, ...items.filter((item) => item.id !== body.confession.id)]);
      setNewConfession(body.confession);
      setDraft(undefined);
      setPrompt("");
      setShowSuccessToast(true);
      setScreen("success");
    } catch (error) {
      setScreen("preview");
      setActionError(error instanceof Error ? error.message : "הפרסום נכשל. נסו שוב.");
    }
  }

  async function handleCancelDraft() {
    if (!draft) {
      setShowCancelConfirm(false);
      setScreen("home");
      return;
    }

    try {
      await fetch(`/api/confessions/draft/${draft.id}`, { method: "DELETE" });
    } finally {
      setDraft(undefined);
      setShowCancelConfirm(false);
      setScreen("home");
    }
  }

  async function handleRatingChange(value: number) {
    if (!selectedConfession) {
      return;
    }

    setRating(value);
    setFlashRating(value);
    window.setTimeout(() => setFlashRating(undefined), 1200);

    const response = await fetch(`/api/confessions/${selectedConfession.id}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: value }),
    });

    if (!response.ok) {
      setActionError(await responseError(response));
      return;
    }

    const body = (await response.json()) as { confession: Confession };
    setConfessions((items) => items.map((item) => (item.id === body.confession.id ? body.confession : item)));
  }

  function resetFilters() {
    setSearch("");
    setCountry("");
    setTopic("");
    setSort("random");
  }

  if (screen === "generating") {
    return <LoadingImageScreen src={images.loadingCroissants} />;
  }

  if (screen === "saving") {
    return <LoadingImageScreen src={images.loadingSuitcase} />;
  }

  if (screen === "detail" && selectedConfession) {
    const closeDetail = () => setScreen(newConfession ? "success" : "home");

    return (
      <ScreenCanvas>
        <Backdrop onClick={closeDetail} />
        <ConfessionCard
          mode="detail"
          confession={selectedConfession}
          rating={rating}
          flashRating={flashRating}
          onRatingChange={(value) => {
            void handleRatingChange(value);
          }}
          onClose={closeDetail}
        />
      </ScreenCanvas>
    );
  }

  if (screen === "preview" && previewConfession && draft) {
    return (
      <ScreenCanvas>
        <Backdrop />
        <ConfessionCard
          mode="preview"
          confession={previewConfession}
          imageOptions={draft.imageOptions}
          actionError={actionError}
          onClose={() => setScreen("home")}
          onCancel={() => setShowCancelConfirm(true)}
          onPublish={(selectedImageUrl) => {
            void handlePublish(selectedImageUrl);
          }}
        />
        {showCancelConfirm ? (
          <Modal title="לבטל את הוידוי?" onCancel={() => setShowCancelConfirm(false)} onConfirm={() => void handleCancelDraft()}>
            הביטול ימחק את הטיוטה ויחזיר אותך למסך הבית.
          </Modal>
        ) : null}
      </ScreenCanvas>
    );
  }

  return (
    <HomeScreen
      prompt={prompt}
      error={promptError ?? loadError}
      search={search}
      country={country}
      topic={topic}
      sort={sort}
      countries={countries}
      topics={topics}
      visibleConfessions={visibleConfessions}
      hasNoResults={hasLoaded && visibleConfessions.length === 0}
      showSuccess={screen === "success" && showSuccessToast}
      newConfession={newConfession}
      showInstructions={showInstructions}
      onPromptChange={(value) => {
        setPrompt(value);
        if (promptError) {
          setPromptError(undefined);
        }
      }}
      onSubmit={handlePromptSubmit}
      onHelp={() => setShowInstructions((value) => !value)}
      onOpenDetail={(id) => {
        setSelectedConfessionId(id);
        setRating(0);
        setActionError(undefined);
        setScreen("detail");
      }}
      onDismissSuccess={() => setShowSuccessToast(false)}
      onSearchChange={setSearch}
      onCountryChange={setCountry}
      onTopicChange={setTopic}
      onSortChange={setSort}
      onResetFilters={resetFilters}
    />
  );
}
