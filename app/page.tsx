"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type Confession,
  type ConfessionDraft,
  type SortValue,
  countryOptions,
  imagePaths,
  sortLabels,
  sortOrder,
  topicOptions,
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
  loadingCroissantsPoster: "/images/loading-croissants-poster.png",
  loadingCroissantsVideo: "/videos/loading-croissants.mp4",
  loadingSuitcase: "/images/loading-suitcase.png",
  marathon: imagePaths.marathon,
  menuBook: "/images/menu-book.svg",
  passport: imagePaths.passport,
  search: "/images/search-icon.svg",
  searchMobile: "/images/search-icon-mobile.svg",
  searchMobileBlue: "/images/search-icon-mobile-blue.svg",
  sendArrow: "/images/send-arrow.svg",
  splashIntroVideo: "/videos/splash-intro.mp4",
  tour: imagePaths.tour,
  waterpark: imagePaths.waterpark,
} as const;

const SPLASH_INTRO_DURATION_MS = 3000;
const REDUCED_MOTION_SPLASH_DURATION_MS = 180;
const SAVE_LOADING_MIN_DURATION_MS = 8000;
const DESKTOP_PROMPT_PLACEHOLDER = "לא להתבייש! כתבו על סיטואציה בה הייתם קצת הישראלי המכוער בחול....";
const MOBILE_PROMPT_PLACEHOLDER = "״איפה הייתם קצת ״הישראלי המכוער?״";
const SUITCASE_LOOP_VIDEO = "/videos/לופ מזוודה.mp4";
const SUITCASE_LOADING_MESSAGES = ["מוסיף את הוידוי שלך...", "חבל, מה לא ניקח?"];

type FilterOptions = {
  countries: string[];
  topics: string[];
};

type CollageImage = {
  src: string;
  alt: string;
  confessionId?: string;
  /** Absolute position (% of the page) + width (vw), fully fluid. */
  className: string;
  rotate: string;
  style?: CSSProperties;
  priority?: boolean;
};

// Scattered scroll confessions live only in the far-left and far-right thirds so
// they never cover the centered logo/title/prompt.
const extraCollagePositions = [
  { className: "left-[-18%] top-[3%] w-[68.5vw] lg:left-[7%] lg:top-[2%] lg:w-[30vw] 2xl:w-[30vw]", rotate: "-rotate-[13deg]" },
  { className: "left-[60%] top-[6%] w-[67.4vw] lg:left-[75%] lg:top-[8%] lg:w-[17.4vw] 2xl:w-[17.4vw]", rotate: "rotate-[10deg]" },
  { className: "left-[-12%] top-[30%] w-[38.5vw] lg:left-[70%] lg:top-[31%] lg:w-[29.6vw] 2xl:w-[29.6vw]", rotate: "rotate-[19deg]" },
  { className: "left-[68%] top-[35%] w-[41vw] lg:left-[2%] lg:top-[34%] lg:w-[18.7vw] 2xl:w-[18.7vw]", rotate: "rotate-[8deg]" },
  { className: "left-[-22%] top-[61%] w-[54.9vw] lg:left-[76%] lg:top-[63%] lg:w-[17.7vw] 2xl:w-[17.7vw]", rotate: "-rotate-[17deg]" },
  { className: "left-[56%] top-[68%] w-[84.1vw] lg:left-[4%] lg:top-[67%] lg:w-[31.9vw] 2xl:w-[31.9vw]", rotate: "rotate-[14deg]" },
];

// Positions are percentages of the collage canvas (~170dvh tall on the home
// screen, so the collage overflows the first viewport and continues as the
// user scrolls), sizes are relative to the viewport width. Images alternate
// between the left and right edges with generous vertical spacing and only a
// slight overlap, keeping the fixed center content clear.
const mobileCollage: CollageImage[] = [
  {
    src: images.cafe,
    alt: "Illustration of travelers at a cafe",
    confessionId: "souvenir-mugs",
    className: "left-[-20%] top-[1%] w-[55vw]",
    rotate: "-rotate-[16.43deg]",
    priority: true,
  },
  {
    src: images.waterpark,
    alt: "Illustration of a water park scene",
    confessionId: "bracelet",
    className: "left-[62%] top-[10%] w-[55vw]",
    rotate: "rotate-[20.07deg]",
    priority: true,
  },
  {
    src: images.hostel,
    alt: "Illustration of a masked tourist",
    confessionId: "train",
    className: "left-[-10%] top-[22%] w-[42vw]",
    rotate: "-rotate-[31.18deg]",
  },
  {
    src: images.flipflops,
    alt: "Illustration of a traveler on red hoverboards",
    confessionId: "honeymoon",
    className: "left-[66%] top-[31%] w-[42vw]",
    rotate: "-rotate-[17.95deg]",
  },
  {
    src: images.dorm,
    alt: "Illustration of travelers sleeping in a shared room",
    confessionId: "budget-room",
    className: "left-[-20%] top-[42%] w-[55vw]",
    rotate: "-rotate-[12.83deg]",
  },
  {
    src: images.beach,
    alt: "Illustration of tourists on a beach",
    confessionId: "honeymoon",
    className: "left-[60%] top-[52%] w-[62vw]",
    rotate: "rotate-[13.47deg]",
  },
  {
    src: images.marathon,
    alt: "Illustration of a runner abroad",
    confessionId: "marathon",
    className: "left-[-24%] top-[64%] w-[58vw]",
    rotate: "rotate-[21.36deg]",
  },
  {
    src: images.tour,
    alt: "Illustration of a tour group",
    confessionId: "gozleme",
    className: "left-[62%] top-[77%] w-[45vw]",
    rotate: "-rotate-[20.55deg]",
  },
];

const desktopCollage: CollageImage[] = [
  {
    src: images.cafe,
    alt: "Illustration of travelers at a cafe",
    confessionId: "souvenir-mugs",
    className: "left-[4%] top-[1%] w-[32vw] 2xl:left-[8%] 2xl:w-[27vw]",
    rotate: "rotate-[11.58deg]",
    priority: true,
  },
  {
    src: images.waterpark,
    alt: "Illustration of a water park scene",
    confessionId: "bracelet",
    className: "left-[66%] top-[4%] w-[31vw] 2xl:left-[69%] 2xl:w-[26vw]",
    rotate: "-rotate-[9.89deg]",
    priority: true,
  },
  {
    src: images.hostel,
    alt: "Illustration of a masked tourist",
    confessionId: "train",
    className: "left-[-4%] top-[23%] w-[21vw] 2xl:left-[0%] 2xl:w-[18vw]",
    rotate: "-rotate-[19.05deg]",
  },
  {
    src: images.flipflops,
    alt: "Illustration of a traveler on red hoverboards",
    confessionId: "honeymoon",
    className: "left-[72%] top-[27%] w-[20vw] 2xl:left-[74%] 2xl:w-[17vw]",
    rotate: "rotate-[25.36deg]",
  },
  {
    src: images.dorm,
    alt: "Illustration of travelers sleeping in a shared room",
    confessionId: "budget-room",
    className: "left-[1%] top-[45%] w-[30vw] 2xl:left-[3%] 2xl:w-[27vw]",
    rotate: "-rotate-[15deg] 2xl:-rotate-[13.94deg]",
  },
  {
    src: images.beach,
    alt: "Illustration of tourists on a beach",
    confessionId: "honeymoon",
    className: "left-[64%] top-[50%] w-[29vw] 2xl:left-[63%] 2xl:w-[26vw]",
    rotate: "rotate-[13.47deg]",
  },
  {
    src: images.tour,
    alt: "Illustration of a tour group",
    confessionId: "gozleme",
    className: "left-[5%] top-[68%] w-[21vw] 2xl:left-[7%] 2xl:w-[18vw]",
    rotate: "rotate-[8.85deg]",
  },
  {
    src: images.marathon,
    alt: "Illustration of a runner abroad",
    confessionId: "marathon",
    className: "left-[76%] top-[73%] w-[21vw] 2xl:left-[79%] 2xl:w-[17vw]",
    rotate: "-rotate-[15deg]",
  },
];

function FloatingIllustration({
  src,
  alt,
  className,
  rotate,
  style,
  priority,
  faded,
  shrunk,
  spin = 0,
  onClick,
}: CollageImage & {
  faded?: boolean;
  shrunk?: boolean;
  spin?: number;
  onClick?: () => void;
}) {
  const content = (
    <div
      className={`ch-collage-item__frame relative aspect-square w-[81%] overflow-hidden shadow-[0.9vw_1vw_0.7vw_-0.3vw_rgba(0,0,0,0.25)] ${rotate} ${faded ? "opacity-50" : ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 35vw, 90vw"
        className="ch-collage-item__image object-cover"
      />
    </div>
  );

  return (
    <div
      className={`ch-collage-item absolute flex aspect-square items-center justify-center transition-all duration-800 ease-out hover:z-20 hover:scale-110 ${
        shrunk ? "scale-[0.86]" : ""
      } ${className}`}
      style={style}
    >
      <div
        className="ch-collage-item__spin flex size-full items-center justify-center transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `rotate(${spin}deg)` }}
      >
        {onClick ? (
          <button type="button" onClick={onClick} className="ch-collage-item__button flex size-full cursor-pointer items-center justify-center">
            {content}
          </button>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

/** Deterministic per-slot spin so scroll rotation direction/strength is stable across renders. */
function spinForIndex(index: number, scrollProgress: number) {
  const direction = index % 2 === 0 ? 1 : -1;
  const magnitude = 0.6 + (((index * 7) % 5) / 5) * 0.4;
  return scrollProgress * 30 * direction * magnitude;
}

type DropdownOption<Value extends string> = {
  value: Value;
  label: string;
};

function CustomDropdown<Value extends string>({
  value,
  options,
  ariaLabel,
  onChange,
  triggerClassName,
  panelClassName,
  optionClassName,
  renderTrigger,
}: {
  value: Value;
  options: DropdownOption<Value>[];
  ariaLabel: string;
  onChange: (value: Value) => void;
  triggerClassName: string;
  panelClassName: string;
  optionClassName: string;
  renderTrigger?: (label: string, open: boolean) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label ?? "";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="ch-dropdown relative shrink-0">
      <button
        type="button"
        className={`ch-dropdown__trigger ${triggerClassName}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {renderTrigger ? renderTrigger(selectedLabel, open) : selectedLabel}
      </button>
      {open ? (
        <div role="listbox" aria-label={ariaLabel} className={`ch-dropdown__panel ${panelClassName}`} dir="rtl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`ch-dropdown__option ${optionClassName}`}
              dir="rtl"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="ch-dropdown__option-label block w-full text-right">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortOptions = sortOrder.map((value) => ({ value, label: sortLabels[value] }));
  const countryDropdownOptions = countries.map((value) => ({ value, label: value }));
  const topicDropdownOptions = topics.map((value) => ({ value, label: value }));
  const searchActive = searchFocused || mobileSearchOpen || search.length > 0;
  const dropdownPanelClass =
    "absolute right-0 top-[calc(100%+8px)] z-50 flex w-[81px] flex-col items-stretch border border-[#998e8a] bg-[#fffcf8] text-right shadow-[2px_3px_8px_rgba(0,0,0,0.12)] lg:w-[104px] 2xl:w-[132px]";
  const dropdownOptionClass =
    "flex h-[29px] w-full items-center justify-end border-b border-[#998e8a] px-[9px] py-0 text-right font-sans text-[14px] leading-normal text-[#745447] transition-colors last:border-b-0 hover:bg-[#d1e2ff] hover:text-[blue] focus:bg-[#d1e2ff] focus:text-[blue] focus:outline-none lg:h-[34px] lg:text-[18px] 2xl:h-[39px] 2xl:text-[24px]";
  const filterClass = (active: boolean) =>
    `inline-flex min-w-[43px] items-center justify-center rounded-[50px] border border-solid bg-transparent px-2 py-0.5 text-center font-sans text-[14px] leading-normal transition-colors lg:min-w-[58px] lg:px-[12px] lg:py-[4px] lg:text-[18px] 2xl:min-w-[69px] 2xl:text-[24px] ${
      active
        ? "border-[blue] text-[blue]"
        : "border-[#998e8a] text-[#745447] hover:border-[blue] hover:bg-[#d1e2ff] hover:text-[blue]"
    }`;

  useEffect(() => {
    if (mobileSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileSearchOpen(false);
        setSearchFocused(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setSearchFocused(false);
    onSearchChange("");
  };

  return (
    <header
      className="ch-header relative z-30 flex h-[clamp(50px,6.5vw,83px)] w-full items-center justify-between overflow-visible border-b border-[#eae5e3] bg-[#fffaf0] px-[clamp(18px,7.2vw,92px)] py-[clamp(10px,1.1vw,13px)]"
      dir="ltr"
    >
      <div className={`ch-header__search-area flex min-w-0 items-center gap-[10px] ${mobileSearchOpen ? "flex-1" : ""} lg:flex-none`}>
        {mobileSearchOpen ? (
          <button
            type="button"
            onClick={closeMobileSearch}
            aria-label="Close search"
            className="ch-header__search-close-btn flex size-[24px] shrink-0 items-center justify-center text-[20px] leading-none text-[#2b2b2b] lg:hidden"
          >
            ✕
          </button>
        ) : null}
        <label
          className={`ch-header__search-label flex min-w-0 items-center rounded-full transition-colors ${
            mobileSearchOpen
              ? "flex-1 justify-between border border-[blue] px-[10px] py-[2px]"
              : "justify-center p-[6px]"
          } lg:w-[clamp(290px,29.5vw,567px)] lg:justify-between lg:border lg:px-[clamp(15px,1.2vw,22px)] lg:py-[4px] ${
            searchActive ? "lg:border-[blue]" : "lg:border-[#998e8a]"
          }`}
          onClick={() => {
            if (!mobileSearchOpen) {
              setMobileSearchOpen(true);
            }
          }}
        >
          <span className="ch-header__search-icon relative h-[12px] w-[10px] shrink-0 lg:h-[clamp(18px,1.15vw,22px)] lg:w-[clamp(15px,1vw,19px)]">
            <Image
              src={searchActive ? images.searchMobileBlue : images.searchMobile}
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
            ref={searchInputRef}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              setSearchFocused(false);
              if (!search.trim()) {
                setMobileSearchOpen(false);
              }
            }}
            placeholder={searchActive ? "" : "חיפוש חופשי"}
            dir="rtl"
            className={`ch-header__search-input ${mobileSearchOpen ? "block text-[12px]" : "hidden"} min-w-0 flex-1 bg-transparent text-right font-sans text-[#745447] placeholder:text-[#745447] focus:outline-none lg:block lg:text-[18px] 2xl:text-[24px]`}
          />
        </label>
      </div>

      <nav className={`ch-header__nav ${mobileSearchOpen ? "hidden" : "flex"} min-w-0 items-center justify-end gap-[clamp(18px,4.9vw,63px)] lg:flex`} dir="rtl">
        <CustomDropdown
          value={sort}
          ariaLabel="Sort confessions"
          options={sortOptions}
          onChange={onSortChange}
          triggerClassName="ch-header__sort flex shrink-0 items-center justify-center gap-1 bg-transparent font-sans text-[14px] text-[#0013be] focus:outline-none lg:gap-[6px] lg:text-[16px] 2xl:gap-2 2xl:text-[24px]"
          panelClassName={dropdownPanelClass}
          optionClassName={dropdownOptionClass}
          renderTrigger={(label) => (
            <>
              <span className="ch-header__sort-label">{label}</span>
              <span className="ch-header__sort-arrow relative h-2 w-1 -rotate-90 lg:h-[11px] lg:w-[6px] 2xl:h-[14.6px] 2xl:w-[8.6px]">
                <Image src={images.arrow} alt="" fill sizes="15px" />
              </span>
            </>
          )}
        />

        <div className="ch-header__filters flex min-w-0 items-center gap-[5px]">
          <span className="ch-header__filter-icon relative size-[14px] shrink-0 lg:size-[clamp(16px,1.3vw,24.873px)]">
            <Image src={images.discoverTune} alt="" fill sizes="25px" />
          </span>
          <div className="ch-header__filter-group flex items-center gap-1.5 lg:gap-[clamp(10px,0.75vw,14px)]">
            <CustomDropdown
              value={country}
              ariaLabel="Filter by country"
              options={countryDropdownOptions}
              onChange={onCountryChange}
              triggerClassName={`ch-header__country-filter ${filterClass(Boolean(country))}`}
              panelClassName={`${dropdownPanelClass} overflow-hidden rounded-[10px]`}
              optionClassName={dropdownOptionClass}
              renderTrigger={(label) => <span className="w-full text-center">{country ? label : "מדינה"}</span>}
            />
            <CustomDropdown
              value={topic}
              ariaLabel="Filter by topic"
              options={topicDropdownOptions}
              onChange={onTopicChange}
              triggerClassName={`ch-header__topic-filter ${filterClass(Boolean(topic))}`}
              panelClassName={`${dropdownPanelClass} overflow-hidden rounded-[10px]`}
              optionClassName={dropdownOptionClass}
              renderTrigger={(label) => <span className="w-full text-center">{topic ? label : "נושא"}</span>}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}

function SendIcon() {
  return (
    <Image src={images.sendArrow} alt="" fill sizes="24px" className="ch-send-icon object-contain" />
  );
}

function HeroContent({
  prompt,
  error,
  isHelpOpen,
  onPromptChange,
  onSubmit,
  onHelp,
}: {
  prompt: string;
  error?: string;
  isHelpOpen: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onHelp: () => void;
}) {
  const [promptFocused, setPromptFocused] = useState(false);
  const [isMobilePrompt, setIsMobilePrompt] = useState(false);
  const promptActive = promptFocused || prompt.length > 0;
  const canSend = prompt.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const placeholder = isMobilePrompt ? MOBILE_PROMPT_PLACEHOLDER : DESKTOP_PROMPT_PLACEHOLDER;

  const resizeTextarea = useCallback(() => {
    const node = textareaRef.current;
    if (!node) {
      return;
    }

    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 220)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [prompt, resizeTextarea]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const syncMobilePrompt = () => setIsMobilePrompt(media.matches);

    syncMobilePrompt();
    media.addEventListener("change", syncMobilePrompt);

    return () => media.removeEventListener("change", syncMobilePrompt);
  }, []);

  return (
    <section className="ch-hero fixed left-1/2 top-1/2 z-20 flex w-full max-w-[1046px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[34px] px-5 lg:gap-[44px] 2xl:gap-[64px]">
      <div className="ch-hero__branding flex w-full flex-col items-center gap-[10px] lg:gap-[14px] 2xl:gap-[20px]">
        <div className="ch-hero__logo-group flex flex-col items-center">
          <div className="ch-hero__logo-wrap relative aspect-482/196 w-[186.593px] lg:w-[273px] 2xl:w-[482px]">
            <Image src={images.logo} alt="Chutzpah" fill priority sizes="(min-width: 1024px) 482px, 190px" className="ch-hero__logo" />
          </div>
          <p className="ch-hero__subtitle font-ploni-yad mt-[-0.12em] text-center text-[50px] leading-none text-[#2b2b2b] lg:text-[72.668px] 2xl:text-[128.309px]">
            איי.אל
          </p>
        </div>

        <p className="ch-hero__tagline max-w-[195px] text-center text-[14px] leading-[1.16] text-[#2b2b2b] lg:max-w-[323px] lg:text-[20px] 2xl:max-w-[1046px] 2xl:text-[24px]">
          ווידויים של ישראלים בחו״ל שהם רמה גבוהה של רמה נמוכה
        </p>
      </div>

      <div className="ch-hero__prompt-area relative flex w-full max-w-[min(92vw,1046px)] flex-col items-center">
        <form
          onSubmit={onSubmit}
          id="hero-prompt-form"
          className={`ch-hero__prompt-form flex w-full items-center justify-end rounded-[40px] border-2 bg-[#fffcf8] px-[clamp(16px,2vw,40px)] py-[clamp(11px,0.85vw,16px)] transition-colors ${
            promptActive
              ? "border-[#2b2b2b] shadow-[6px_4px_10.2px_0px_rgba(0,0,0,0.25),70px_15px_43px_0px_rgba(0,0,0,0.05),31px_7px_32px_0px_rgba(0,0,0,0.09),8px_2px_17px_0px_rgba(0,0,0,0.1)]"
              : "border-[blue] shadow-[6px_4px_10.2px_0px_rgba(0,0,255,0.25),70px_15px_43px_0px_rgba(0,0,0,0.05),31px_7px_32px_0px_rgba(0,0,0,0.09),8px_2px_17px_0px_rgba(0,0,0,0.1)]"
          }`}
        >
          <span className="ch-hero__prompt-row flex w-full items-center justify-end gap-[7px] lg:gap-[19.52px] 2xl:gap-[26px]" dir="rtl">
            <div className="ch-hero__help-group group relative flex shrink-0 items-center">
              <button
                type="button"
                onClick={onHelp}
                className={`ch-hero__help-btn relative flex size-[30px] items-center justify-center rounded-[6.563px] p-[2.813px] transition-colors hover:bg-[#d1e2ff] lg:size-[42px] lg:p-[3.938px] 2xl:size-[53px] ${
                  isHelpOpen ? "bg-[#d1e2ff]" : ""
                }`}
                aria-label="Prompt writing instructions"
                aria-pressed={isHelpOpen}
              >
                <span className="ch-hero__help-icon relative size-[24.375px] lg:size-[34.125px] 2xl:size-[44.817px]">
                  <Image
                    src={images.menuBook}
                    alt=""
                    fill
                    sizes="45px"
                    className={isHelpOpen ? "brightness-0" : undefined}
                  />
                </span>
              </button>
              <span className="ch-hero__help-tooltip prompt-tooltip pointer-events-none absolute bottom-[calc(100%+8px)] right-0 hidden whitespace-nowrap rounded-[8px] px-[10px] py-[5px] text-[12px] leading-none opacity-0 transition-opacity group-hover:block group-hover:opacity-100 lg:text-[14px]">
                הוראות
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={prompt}
              rows={1}
              onChange={(event) => {
                onPromptChange(event.target.value);
                resizeTextarea();
              }}
              onFocus={() => setPromptFocused(true)}
              onBlur={() => setPromptFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={promptActive ? "" : placeholder}
              dir="rtl"
              className="ch-hero__prompt-textarea min-w-0 flex-1 resize-none self-center overflow-hidden bg-transparent py-0 text-right font-sans text-[14px] leading-[1.2] text-[#2b2b2b] placeholder:text-[#998e8a] focus:outline-none lg:text-[20px] lg:leading-[1.2] 2xl:text-[24px]"
            />
            {canSend ? (
              <button
                type="submit"
                aria-label="שליחה"
                className="ch-hero__submit-btn relative flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[blue] p-[6px] transition-colors hover:bg-[#0010a8] lg:size-[42px] lg:p-[9px] 2xl:size-[53px] 2xl:p-[12px]"
              >
                <span className="ch-hero__submit-icon relative block size-full">
                  <SendIcon />
                </span>
              </button>
            ) : null}
          </span>
        </form>
        {isHelpOpen ? <InstructionsCard onClose={onHelp} /> : null}
      </div>
      {error ? (
        <div className="ch-hero__error fixed left-1/2 top-1/2 z-50 flex w-[min(86vw,348px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[10px] rounded-[13.127px] border-2 border-[#a90e25] bg-[#ffe4d7] px-8 py-[27.566px] text-center drop-shadow-[128px_74px_20.5px_rgba(0,0,0,0),82px_47px_19px_rgba(0,0,0,0.01),46px_27px_16px_rgba(0,0,0,0.05),21px_12px_12px_rgba(0,0,0,0.09),5px_3px_6.5px_rgba(0,0,0,0.1)]">
          <strong className="ch-hero__error-title font-haim text-[40px] leading-none text-[#a90e25]">לא משהו...</strong>
          <span className="ch-hero__error-message text-[14px] leading-[1.2] text-[#2b2b2b] lg:text-[18px] 2xl:text-[20px]">{error}</span>
        </div>
      ) : null}
    </section>
  );
}

function shuffledIndexes(length: number) {
  const indexes = Array.from({ length }, (_, index) => index);
  let seed = length * 2654435761;

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

function SplashAnimatedCollage({ items }: { items: CollageImage[] }) {
  const [order] = useState(() => shuffledIndexes(items.length));
  const delays = order.reduce<number[]>((result, itemIndex, orderIndex) => {
    result[itemIndex] = 650 + orderIndex * 130;
    return result;
  }, []);

  return (
    <Collage
      items={items.map((item, index) => ({
        ...item,
        className: `splash-sequence-image ${item.className}`,
        style: {
          ...item.style,
          animationDelay: `${delays[index] ?? 650}ms`,
        },
      }))}
    />
  );
}

function SplashIntro({ header, onDone }: { header: ReactNode; onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);
  const finish = useCallback(() => {
    if (doneRef.current) {
      return;
    }

    doneRef.current = true;
    setExiting(true);
    window.setTimeout(onDone, 300);
  }, [onDone]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(finish, reduceMotion ? REDUCED_MOTION_SPLASH_DURATION_MS : SPLASH_INTRO_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [finish]);

  return (
    <div
      aria-hidden="true"
      className={`ch-splash pointer-events-none absolute inset-0 z-50 overflow-hidden bg-[#fffaf0] transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="ch-splash__collage-mobile absolute inset-x-0 top-0 h-[170dvh] lg:hidden">
        <SplashAnimatedCollage items={mobileCollage} />
      </div>
      <div className="ch-splash__collage-desktop absolute inset-x-0 top-0 hidden h-[170dvh] lg:block">
        <SplashAnimatedCollage items={desktopCollage} />
      </div>
      <div className="ch-splash__logo splash-logo-sequence absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="ch-splash__logo-wrap relative aspect-482/196 w-[186.593px] lg:w-[273px] 2xl:w-[482px]">
          <Image src={images.logo} alt="" fill priority sizes="(min-width: 1536px) 482px, (min-width: 1024px) 273px, 187px" className="ch-splash__logo-image" />
        </div>
        <p className="ch-splash__logo-text font-ploni-yad mt-[-0.12em] text-center text-[50px] leading-none text-[#2b2b2b] lg:text-[72.668px] 2xl:text-[128.309px]">
          איי.אל
        </p>
      </div>
      <div className="ch-splash__header splash-menu-sequence absolute inset-x-0 top-0 z-30">{header}</div>
    </div>
  );
}

function Collage({
  items,
  faded = false,
  shrinkIndex,
  scrollProgress = 0,
  onOpenDetail,
}: {
  items: CollageImage[];
  faded?: boolean;
  shrinkIndex?: number;
  scrollProgress?: number;
  onOpenDetail?: (id: string) => void;
}) {
  return (
    <>
      {items.map((item, index) => (
        <FloatingIllustration
          key={`${item.confessionId ?? item.src}-${index}`}
          {...item}
          faded={faded}
          shrunk={index === shrinkIndex}
          spin={spinForIndex(index, scrollProgress)}
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

function ExtraConfessionsGrid({
  confessions,
  scrollProgress = 0,
  onOpenDetail,
}: {
  confessions: Confession[];
  scrollProgress?: number;
  onOpenDetail: (id: string) => void;
}) {
  if (confessions.length === 0) {
    return null;
  }

  const rows = Math.ceil(confessions.length / extraCollagePositions.length);

  return (
    <section
      className="ch-extra-grid relative z-10 mx-auto min-h-[720px] w-full pb-20"
      style={{ height: `${rows * 820}px` }}
    >
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="ch-extra-grid__row absolute inset-x-0 h-[820px]" style={{ top: `${row * 820}px` }}>
          {confessions.slice(row * extraCollagePositions.length, (row + 1) * extraCollagePositions.length).map((confession, index) => {
            const position = extraCollagePositions[index % extraCollagePositions.length];
            const absoluteIndex = row * extraCollagePositions.length + index;

            return (
              <FloatingIllustration
                key={confession.id}
                src={confession.image}
                alt={confession.title}
                confessionId={confession.id}
                className={position.className}
                rotate={position.rotate}
                spin={spinForIndex(absoluteIndex, scrollProgress)}
                onClick={() => onOpenDetail(confession.id)}
              />
            );
          })}
        </div>
      ))}
    </section>
  );
}

function NewConfessionIllustration({ confession }: { confession: Confession }) {
  return (
    <div className="ch-new-confession absolute left-[5%] top-[42%] z-10 flex aspect-square w-[64vw] animate-[passportIn_800ms_ease-out] items-center justify-center lg:left-[18%] lg:top-[58%] lg:w-[24.5vw]">
      <div className="ch-new-confession__frame relative aspect-square w-[81%] rotate-[-15.76deg] overflow-hidden shadow-[0.9vw_1vw_0.7vw_-0.3vw_rgba(0,0,0,0.25)]">
        <Image src={confession.image} alt={confession.title} fill className="ch-new-confession__image object-cover" sizes="(min-width: 1024px) 25vw, 64vw" />
      </div>
    </div>
  );
}

type Screen = "home" | "detail" | "generating" | "preview" | "saving" | "success";

function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      className="ch-success-toast absolute left-1/2 top-[129px] z-40 flex -translate-x-1/2 flex-col items-center justify-center gap-[10px] rounded-[13.127px] border-2 border-[#8cc63f] bg-[#f7ffec] p-[30px] text-center drop-shadow-[128px_74px_20.5px_rgba(0,0,0,0),82px_47px_19px_rgba(0,0,0,0.01),46px_27px_16px_rgba(0,0,0,0.05),21px_12px_12px_rgba(0,0,0,0.09),5px_3px_6.5px_rgba(0,0,0,0.1)] lg:top-[136px] lg:w-[420px] 2xl:top-[160px] 2xl:w-[540px]"
    >
      <span className="ch-success-toast__title font-haim w-[106px] text-[26px] text-[#61a605] lg:w-auto lg:text-[34px] 2xl:text-[46px]">היידה!</span>
      <span className="ch-success-toast__message w-[182px] text-[14px] text-[#2b2b2b] lg:w-auto lg:text-[18px] 2xl:text-[24px]">הוידוי שלך נוסף למאגר בהצלחה</span>
    </button>
  );
}

function Backdrop({ onClick }: { onClick?: () => void }) {
  return (
    <>
      <div className="ch-backdrop absolute inset-0 overflow-hidden">
        <div className="ch-backdrop__collage-mobile absolute inset-x-0 top-0 h-[170dvh] lg:hidden">
          <Collage items={mobileCollage} faded />
        </div>
        <div className="ch-backdrop__collage-desktop absolute inset-x-0 top-0 hidden h-[170dvh] lg:block">
          <Collage items={desktopCollage} faded />
        </div>
      </div>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="ch-backdrop__overlay-btn absolute inset-0 z-10 bg-[rgba(255,250,240,0.8)] backdrop-blur-[3.15px]"
          aria-label="Close confession"
        />
      ) : (
        <div className="ch-backdrop__overlay absolute inset-0 z-10 bg-[rgba(255,250,240,0.8)] backdrop-blur-[3.15px]" />
      )}
    </>
  );
}

function ScreenCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="ch-screen-canvas smooth-scroll relative h-dvh min-h-dvh w-full overflow-y-auto overflow-x-hidden bg-[#fffaf0] font-sans text-[#2b2b2b]" dir="rtl">
      {children}
    </div>
  );
}

function TagPill({ children }: { children: ReactNode }) {
  return (
    <span className="ch-tag-pill rounded-full border border-[#998e8a] px-2 py-0.5 text-right font-sans text-[14px] text-[#745447] lg:text-[18px] 2xl:text-[24px]" dir="rtl">
      {children}
    </span>
  );
}

function ChutzpahMeter({
  rating = 0,
  onRatingChange,
  onRatingCommit,
}: {
  rating?: number;
  onRatingChange?: (value: number) => void;
  onRatingCommit?: (value: number) => void;
}) {
  const value = Math.max(0, Math.min(100, rating));

  return (
    <div className="ch-meter flex w-[296px] flex-col items-end justify-center gap-2 lg:w-auto lg:flex-row lg:items-end lg:gap-[22.336px]" dir="ltr">
      <p className="ch-meter__label order-1 w-full shrink-0 text-right text-[14px] font-bold lg:order-2 lg:w-auto lg:whitespace-nowrap lg:pb-[2px] lg:text-[20px] 2xl:text-[26px]" dir="rtl">
        <span className="ch-meter__label-mobile lg:hidden">דרגי בחוצפמטר</span>
        <span className="ch-meter__label-desktop hidden lg:inline">דרג.י בחוצפמטר:</span>
      </p>
      <div
        dir="ltr"
        className="ch-meter__track chutzpah-meter order-2 relative h-[52px] w-[296px] max-w-full lg:order-1 lg:h-[63px] lg:w-[470px] 2xl:h-[68px] 2xl:w-[640px]"
      >
        <span
          className="ch-meter__value-tooltip absolute top-[-8px] z-10 h-[27px] min-w-[48px] -translate-x-1/2 rounded-[5px] bg-white px-2 text-center text-[14px] leading-[27px] text-[#2b2b2b] shadow-[1px_1px_4px_rgba(0,0,0,0.25)] lg:text-[18px] 2xl:h-[34px] 2xl:min-w-[62px] 2xl:text-[22px] 2xl:leading-[34px]"
          style={{ left: `calc(${value}% + (0.5 - ${value / 100}) * var(--thumb-size))` }}
        >
          {value}%
        </span>
        <div className="ch-meter__bar absolute left-0 top-[31px] h-[20px] w-full overflow-hidden rounded-[20px] border border-[blue] bg-[#fffcf8] lg:top-[39px] 2xl:top-[40px] 2xl:h-[27px]">
          <div className="ch-meter__fill h-full rounded-[20px] bg-[#d1e2ff]" style={{ width: `${value}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={value}
          dir="ltr"
          onPointerUp={(event) => {
            onRatingCommit?.(Number(event.currentTarget.value));
          }}
          onChange={(event) => onRatingChange?.(Number(event.target.value))}
          className="ch-meter__input chutzpah-range absolute left-0 top-[26px] w-full lg:top-[34px] 2xl:top-[35px]"
          style={{ height: "var(--thumb-size)" }}
          aria-label="Chutzpah meter"
        />
      </div>
    </div>
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
  onRatingCommit,
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
  onRatingCommit?: (value: number) => void;
  onClose?: () => void;
  onCancel?: () => void;
  onPublish?: (selectedImageUrl: string) => void;
}) {
  const isPreview = mode === "preview";
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [selectedPreviewImageIndex, setSelectedPreviewImageIndex] = useState<number>();
  const previewImages = imageOptions?.length ? imageOptions : [confession.image];
  const image = isPreview ? previewImages[previewImageIndex] : confession.image;
  const selectedImage = isPreview ? previewImages[selectedPreviewImageIndex ?? previewImageIndex] : image;

  return (
    <div
      className={
        isPreview
          ? "ch-confession-card ch-confession-card--preview relative z-20 mx-auto mt-[80px] flex w-[342px] flex-col items-center gap-[22px] pb-10 lg:absolute lg:left-1/2 lg:top-1/2 lg:mt-0 lg:w-[min(86vw,1013px)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:pb-0 2xl:w-[1390px]"
          : "ch-confession-card ch-confession-card--detail relative z-20 mx-auto mt-[55px] flex w-[342px] flex-col items-center gap-[16px] pb-[260px] lg:absolute lg:left-1/2 lg:top-1/2 lg:mt-0 lg:w-[min(86vw,1013px)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:pb-0 2xl:w-[1390px]"
      }
    >
      <article
        className="ch-confession-card__article flex w-full flex-col items-center bg-[#fffcf8] pb-5 text-right drop-shadow-[4px_4px_3.3px_rgba(0,0,0,0.25)] lg:h-[620px] lg:flex-row lg:items-stretch lg:justify-center lg:pb-0 2xl:h-[850px]"
        dir="ltr"
      >
        <div
          className={`ch-confession-card__image-wrap relative aspect-square w-full overflow-hidden lg:h-full lg:aspect-square lg:w-auto lg:shrink-0 ${
            isPreview && selectedPreviewImageIndex === previewImageIndex ? "ring-4 ring-[blue]" : ""
          }`}
        >
          <Image src={image} alt={confession.title} fill priority className="ch-confession-card__image object-cover" sizes="342px" />
          {isPreview ? (
            <button
              type="button"
              onClick={() => setSelectedPreviewImageIndex(previewImageIndex)}
              className="ch-confession-card__image-select-btn absolute inset-0 z-10 cursor-pointer"
              aria-label="Select this preview image"
            />
          ) : null}
          {flashRating !== undefined ? (
            <div className="ch-confession-card__flash-rating absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-[6.837px] bg-[#fffcf8] px-[30px] py-[13px] text-[27px] font-bold text-[#2b2b2b] shadow-[3px_3px_18px_rgba(0,0,0,0.18)]">
              {flashRating}%
            </div>
          ) : null}
          {!isPreview ? (
            <button
              type="button"
              onClick={onClose}
              className="ch-confession-card__close-btn ch-confession-card__close-btn--mobile absolute right-[25px] top-[10px] z-20 flex size-[60px] items-center justify-center text-[46px] leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] lg:hidden"
              aria-label="Close"
            >
              ×
            </button>
          ) : null}
          {isPreview ? (
            <>
              <div className="ch-confession-card__preview-gradient absolute inset-x-0 bottom-0 h-[76px] bg-linear-to-b from-transparent to-[rgba(0,0,0,0.7)]" />
              <div className="ch-confession-card__preview-nav absolute bottom-[17px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-[108px] text-[34px] leading-none text-white lg:gap-[218.63px]">
                <button
                  type="button"
                  onClick={() => setPreviewImageIndex((value) => (value + previewImages.length - 1) % previewImages.length)}
                  aria-label="Previous preview image"
                  className="ch-confession-card__preview-prev drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                >
                  ←
                </button>
                <span className="ch-confession-card__preview-dots flex items-center gap-1">
                  {previewImages.map((option, index) => (
                    <span
                      key={`${option}-${index}`}
                      className={`ch-confession-card__preview-dot block rounded-full ${index === previewImageIndex ? "size-[14px] bg-white" : "size-[9px] bg-white/55"}`}
                    />
                  ))}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImageIndex((value) => (value + 1) % previewImages.length)}
                  aria-label="Next preview image"
                  className="ch-confession-card__preview-next drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                >
                  →
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div
          className={`ch-confession-card__content relative mt-5 flex w-[292px] flex-col items-end gap-4 text-right lg:m-0 lg:h-full lg:flex-1 lg:justify-start lg:px-[70px] 2xl:px-[86px] ${
            isPreview ? "lg:py-[20px] 2xl:py-[40px]" : "lg:pb-[69px] lg:pt-[68px] 2xl:pb-[92px] 2xl:pt-[92px]"
          }`}
          dir="rtl"
        >
          {!isPreview ? (
            <button
              type="button"
              onClick={onClose}
              className="ch-confession-card__close-btn ch-confession-card__close-btn--desktop hidden items-center justify-center text-[46px] leading-none text-[#2b2b2b] lg:absolute lg:right-[22px] lg:top-[20px] lg:flex lg:h-[21px] lg:w-[31.5px] 2xl:right-[30px] 2xl:top-[28px] 2xl:h-[28px] 2xl:w-[42px] 2xl:text-[60px]"
              aria-label="Close"
            >
              ×
            </button>
          ) : null}
          <div className="ch-confession-card__header flex w-full flex-col items-end gap-[13px]">
            <div className="ch-confession-card__title-group flex w-full flex-col items-end gap-1.5">
              {isPreview ? <p className="ch-confession-card__preview-label w-full text-right text-[14px] text-[blue] lg:text-[20px] 2xl:text-[24px]">תצוגה לפני פרסום</p> : null}
              <div className="ch-confession-card__title-row flex w-full flex-col items-end gap-0.5">
                <h1 className="ch-confession-card__title w-full text-right font-haim text-[26px] leading-none text-[blue] lg:text-[36px] 2xl:text-[52px]">{confession.title}</h1>
                <p className="ch-confession-card__date w-full text-right text-[14px] text-[#868686] lg:text-[18px] 2xl:text-[24px]">{confession.date}</p>
              </div>
            </div>
            <p className="ch-confession-card__body ml-auto mr-0 w-full text-right text-[14px] leading-[1.296] text-[#2b2b2b] lg:max-w-[214px] lg:text-[18px] 2xl:max-w-[286px] 2xl:text-[24px]">{confession.content}</p>
            {!isPreview ? (
              <p className="ch-confession-card__average-score w-full text-right text-[14px] lg:text-[18px] 2xl:text-[24px]">
                <span className="ch-confession-card__average-score-label text-[#998e8a]">דירוג חוצפמטר ממוצע:</span>{" "}
                <span className="ch-confession-card__average-score-value text-[#2b2b2b]">{confession.averageScore}%</span>
              </p>
            ) : null}
          </div>
          <div className="ch-confession-card__tags-section mt-auto flex w-full flex-col items-end gap-2">
            <span className="ch-confession-card__tags-label hidden w-full text-right font-bold text-[#2b2b2b] lg:block lg:text-[18px] 2xl:text-[24px]">תגים:</span>
            <div className="ch-confession-card__tags flex w-full flex-wrap items-center justify-end gap-2" dir="rtl">
              {confession.tags.map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </div>
          </div>
        </div>
      </article>

      {isPreview ? (
        <div className="ch-confession-card__actions flex items-center gap-[10px] lg:mt-1" dir="rtl">
          <button
            type="button"
            onClick={() => onPublish?.(selectedImage)}
            className="ch-confession-card__publish-btn flex w-[101px] items-center justify-center gap-[6px] rounded-[50.116px] bg-[blue] px-5 py-[5px] text-[20px] font-semibold text-[#fffcf8] transition-colors hover:bg-[#0010a8] 2xl:w-[134px] 2xl:text-[24px]"
            dir="rtl"
          >
            <span className="ch-confession-card__publish-icon leading-none">↑</span>
            <span className="ch-confession-card__publish-label">פרסום</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="ch-confession-card__cancel-btn rounded-full border border-[#998e8a] px-[18px] py-[5px] text-[20px] text-[#2b2b2b] transition-colors hover:bg-[#eae5e3] 2xl:text-[24px]"
          >
            ביטול
          </button>
          {actionError ? <p className="ch-confession-card__action-error max-w-[300px] text-right text-[14px] text-[blue] lg:text-[18px] 2xl:text-[24px]">{actionError}</p> : null}
        </div>
      ) : (
        <ChutzpahMeter rating={rating} onRatingChange={onRatingChange} onRatingCommit={onRatingCommit} />
      )}
    </div>
  );
}

function LoadingImageScreen({ src }: { src: string }) {
  const isCroissants = src === images.loadingCroissants;
  const isSuitcase = src === images.loadingSuitcase;
  const [suitcaseMessageIndex, setSuitcaseMessageIndex] = useState(0);
  const loadingText = isSuitcase ? SUITCASE_LOADING_MESSAGES[suitcaseMessageIndex] : "מעמיס רגע כמה נתונים";

  useEffect(() => {
    if (!isSuitcase) {
      return;
    }

    const timer = window.setInterval(() => {
      setSuitcaseMessageIndex((value) => (value + 1) % SUITCASE_LOADING_MESSAGES.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [isSuitcase]);

  const frameClassName =
    "ch-loading-screen__frame absolute left-1/2 top-1/2 z-20 flex h-[min(67dvh,430px)] w-[342px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center bg-[#fefdf8] px-0 py-[35px] text-center drop-shadow-[204px_141px_34.5px_rgba(0,0,0,0),130px_90px_32px_rgba(0,0,0,0.01),73px_51px_27px_rgba(0,0,0,0.05),33px_23px_20px_rgba(0,0,0,0.09),8px_6px_11px_rgba(0,0,0,0.1)] lg:h-[620px] lg:w-[1013px] lg:px-[210px] lg:pb-[42px] lg:pl-[210px] lg:pr-[211px] lg:pt-[35px]";
  const textClassName = "ch-loading-screen__text shrink-0 text-center text-[20px] text-[#2b2b2b] lg:text-[24px] 2xl:text-[30px]";

  if (isCroissants) {
    return (
      <ScreenCanvas>
        <Backdrop />
        <div className={`ch-loading-screen ch-loading-screen--croissants ${frameClassName} gap-[20px] lg:gap-[14px]`} data-figma-name="לופ העמסת מזון" data-figma-node-id="1115:31631">
          <video
            className="ch-loading-screen__video h-[263px] w-[341px] shrink-0 object-contain lg:h-[705px] lg:w-[913px]"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src={images.loadingCroissantsVideo} type="video/mp4" />
          </video>
          <p className={textClassName}>
            {loadingText}
            <span className="ch-loading-screen__dots loading-dots" aria-hidden="true" />
          </p>
        </div>
      </ScreenCanvas>
    );
  }

  return (
    <ScreenCanvas>
      <Backdrop />
      <div className={`ch-loading-screen ch-loading-screen--suitcase ${frameClassName} gap-[20px] lg:gap-[14px]`} data-figma-name="לופ מזוודה" data-figma-node-id="1179:12877">
        <video
          className="ch-loading-screen__video h-[296px] w-[312px] shrink-0 object-contain lg:h-[704px] lg:w-[741px]"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src={SUITCASE_LOOP_VIDEO} type="video/mp4" />
        </video>
        <p className={textClassName}>
          {loadingText}
        </p>
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
    <div className="ch-modal absolute inset-0 z-50 flex items-center justify-center bg-black/25 px-6">
      <div className="ch-modal__dialog flex w-[330px] flex-col items-center gap-[10px] rounded-[13.127px] border-2 border-[#fbb03b] bg-[#fff9de] px-8 py-7 text-center drop-shadow-[128px_74px_20.5px_rgba(0,0,0,0),82px_47px_19px_rgba(0,0,0,0.01),46px_27px_16px_rgba(0,0,0,0.05),21px_12px_12px_rgba(0,0,0,0.09),5px_3px_6.5px_rgba(0,0,0,0.1)] lg:w-[466px] lg:px-[78px] 2xl:w-[560px]">
        <h2 className="ch-modal__title font-haim text-[40px] leading-none text-[#fbb03b]">{title}</h2>
        <div className="ch-modal__content text-[20px] leading-[0.98] text-[#2b2b2b]">{children}</div>
        <div className="ch-modal__actions flex gap-3">
          {onConfirm ? (
            <button type="button" onClick={onConfirm} className="ch-modal__confirm-btn rounded-full border border-[#998e8a] px-[18px] py-[5px] text-[20px] text-[#2b2b2b] transition-colors hover:bg-[#eae5e3]">
              למחוק
            </button>
          ) : null}
          <button type="button" onClick={onCancel} className="ch-modal__cancel-btn rounded-full bg-[blue] px-5 py-[5px] text-[20px] font-semibold text-[#fffcf8] transition-colors hover:bg-[#0010a8]">
            להישאר
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="ch-empty-state absolute left-1/2 top-[65%] z-30 flex -translate-x-1/2 flex-col items-center gap-3 rounded-[18px] border border-[#998e8a] bg-[#fffcf8]/95 px-6 py-5 text-center shadow-[6px_6px_18px_rgba(0,0,0,0.15)]">
      <p className="ch-empty-state__message text-[16px] text-[#2b2b2b] lg:text-[20px] 2xl:text-[24px]">לא נמצאו וידויים מתאימים</p>
      <button type="button" onClick={onReset} className="ch-empty-state__reset-btn rounded-full bg-[blue] px-5 py-1.5 text-[14px] text-[#fffcf8] lg:text-[18px] 2xl:text-[24px]">
        איפוס סינון
      </button>
    </div>
  );
}

function CheckInstructionIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="ch-instruction-icon ch-instruction-icon--check size-[18px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 9.25L7.35 12.6L14 5.9" stroke="#61A605" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XInstructionIcon() {
  return (
    <svg viewBox="0 0 19 12.667" aria-hidden="true" className="ch-instruction-icon ch-instruction-icon--x h-[12.667px] w-[19px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.2 2.55L13.8 11.15M13.8 2.55L5.2 11.15" stroke="#C4142F" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function ExclamationInstructionIcon() {
  return (
    <span aria-hidden="true" className="ch-instruction-icon ch-instruction-icon--exclamation flex h-[23.294px] w-[18px] items-center justify-center text-center text-[23.294px] font-bold leading-none text-[#fbb03b]">
      !
    </span>
  );
}

function InstructionsContent() {
  const rows = [
    { icon: <CheckInstructionIcon />, text: "תנו ג׳וס- תארו מה עשיתם, איפה? למה? כמה? עם מי? ומה עבר לכם בראש" },
    { icon: <CheckInstructionIcon />, text: "תהיו ספציפיים- ככל שתהיו ספציפיים וכנים יותר התוצאה תהיה מדויקת יותר" },
    { icon: <XInstructionIcon />, text: "לא להתקמצן במידע... משפט אחד/ כמה מילים לא נחשבות לוידוי" },
    { icon: <ExclamationInstructionIcon />, text: "שגר ושכח! תחשבו טוב טוב לפני שאתם מפרסמים... אין דרך חזרה!" },
  ];

  return (
    <>
      <h2 className="ch-instructions__title w-full text-right font-haim text-[20px] text-[#020202] lg:text-[24px] 2xl:text-[30px]">איך לכתוב וידוי טוב?</h2>
      <div className="ch-instructions__list flex w-full flex-col gap-[10px] lg:gap-[14px]">
        {rows.map(({ icon, text }) => (
          <p
            key={text}
            className="ch-instructions__row flex w-full items-center justify-end gap-[18px] text-right text-[14px] leading-[1.477] text-[#2b2b2b] lg:text-[20px] 2xl:text-[24px]"
            dir="ltr"
          >
            <span className="ch-instructions__text" dir="rtl">{text}</span>
            <span className="ch-instructions__icon flex w-[19px] shrink-0 items-center justify-center">{icon}</span>
          </p>
        ))}
      </div>
    </>
  );
}

function InstructionsCard({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="ch-instructions absolute left-1/2 top-[calc(100%+10px)] z-50 flex w-full -translate-x-1/2 flex-col items-end gap-[9px] rounded-[28px] border-2 border-[#eae5e3] bg-[#fffcf8] px-5 py-5 text-right shadow-[4px_4px_12px_rgba(0,0,0,0.18)] lg:z-40 lg:px-[71px]"
      dir="rtl"
    >
      <button
        type="button"
        onClick={onClose}
        className="ch-instructions__close-btn absolute left-4 top-3 text-[24px] leading-none text-[#2b2b2b] lg:hidden"
        aria-label="Close instructions"
      >
        ×
      </button>
      <InstructionsContent />
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
  showSplashIntro,
  showSuccess,
  newConfession,
  newConfessionEntering,
  showInstructions,
  onPromptChange,
  onSubmit,
  onHelp,
  onOpenDetail,
  onSplashIntroDone,
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
  showSplashIntro?: boolean;
  showSuccess?: boolean;
  newConfession?: Confession;
  newConfessionEntering?: boolean;
  showInstructions?: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onHelp: () => void;
  onOpenDetail: (id: string) => void;
  onSplashIntroDone: () => void;
  onDismissSuccess: () => void;
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onSortChange: (value: SortValue) => void;
  onResetFilters: () => void;
}) {
  const mainRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const reflowKey = `${sort}|${country}|${topic}|${search}|${visibleConfessions.map((confession) => confession.id).join(",")}`;

  useEffect(() => {
    const node = mainRef.current;
    if (!node) {
      return;
    }

    let frame = 0;
    const handleScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrollProgress(Math.max(0, Math.min(1, node.scrollTop / 600)));
      });
    };

    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", handleScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  const collageConfessions =
    newConfession && newConfessionEntering
      ? visibleConfessions.filter((confession) => confession.id !== newConfession.id)
      : visibleConfessions;
  const mobileItems = collageItemsForConfessions(mobileCollage, collageConfessions);
  const desktopItems = collageItemsForConfessions(desktopCollage, collageConfessions);

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
      className="ch-home relative flex h-dvh w-full flex-col overflow-hidden bg-[#fffaf0] font-sans text-[#2b2b2b]"
      dir="rtl"
    >
      {renderHeader()}
      <main ref={mainRef} className="ch-home__main smooth-scroll relative min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden" aria-label="Homepage hero">
        <div key={`m-${reflowKey}`} className="ch-home__collage-mobile gallery-reflow absolute inset-x-0 -top-[clamp(50px,6.5vw,83px)] z-0 h-[170dvh] lg:hidden">
          <Collage items={mobileItems} shrinkIndex={newConfession && newConfessionEntering ? 4 : undefined} scrollProgress={scrollProgress} onOpenDetail={onOpenDetail} />
        </div>
        <div key={`d-${reflowKey}`} className="ch-home__collage-desktop gallery-reflow absolute inset-x-0 -top-[clamp(50px,6.5vw,83px)] z-0 hidden h-[170dvh] lg:block">
          <Collage items={desktopItems} shrinkIndex={newConfession && newConfessionEntering ? 6 : undefined} scrollProgress={scrollProgress} onOpenDetail={onOpenDetail} />
        </div>
        {/* Flow spacer so the collage canvas (taller than the viewport) is reachable by scrolling. */}
        <div aria-hidden="true" className="ch-home__scroll-spacer h-[calc(170dvh-clamp(50px,6.5vw,83px))]" />
        {newConfession && newConfessionEntering ? <NewConfessionIllustration confession={newConfession} /> : null}
        <HeroContent
          prompt={prompt}
          error={error}
          isHelpOpen={Boolean(showInstructions)}
          onPromptChange={onPromptChange}
          onSubmit={onSubmit}
          onHelp={onHelp}
        />
        {showSuccess ? <SuccessToast onDismiss={onDismissSuccess} /> : null}
        {hasNoResults ? <EmptyState onReset={onResetFilters} /> : null}
        <ExtraConfessionsGrid confessions={collageConfessions.slice(8)} scrollProgress={scrollProgress} onOpenDetail={onOpenDetail} />
      </main>
      {showSplashIntro ? <SplashIntro header={renderHeader()} onDone={onSplashIntroDone} /> : null}
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
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    countries: [...countryOptions],
    topics: [...topicOptions],
  });
  const [selectedConfessionId, setSelectedConfessionId] = useState("");
  const [draft, setDraft] = useState<ConfessionDraft>();
  const [newConfession, setNewConfession] = useState<Confession>();
  const [newConfessionEntering, setNewConfessionEntering] = useState(false);
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
  const [showSplashIntro, setShowSplashIntro] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [shuffleNonce, setShuffleNonce] = useState(0);

  const visibleConfessions = confessions;
  const countries = filterOptions.countries;
  const topics = filterOptions.topics;
  const selectedConfession = confessions.find((item) => item.id === selectedConfessionId);
  const previewConfession = draft ? draftToConfession(draft) : undefined;
  const hideSplashIntro = useCallback(() => setShowSplashIntro(false), []);

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
        if (sort === "random") {
          params.set("shuffle", String(shuffleNonce));
        }

        try {
          const response = await fetch(`/api/confessions?${params.toString()}`, {
            cache: "no-store",
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(await responseError(response));
          }

          const body = (await response.json()) as {
            confessions: Confession[];
            filterOptions?: Partial<FilterOptions>;
          };
          setConfessions(body.confessions);
          setFilterOptions({
            countries: body.filterOptions?.countries?.length ? body.filterOptions.countries : [...countryOptions],
            topics: body.filterOptions?.topics?.length ? body.filterOptions.topics : [...topicOptions],
          });
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
  }, [country, search, shuffleNonce, sort, topic]);

  useEffect(() => {
    if (!showSuccessToast) {
      return;
    }

    const timer = window.setTimeout(() => setShowSuccessToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showSuccessToast]);

  useEffect(() => {
    if (!newConfessionEntering) {
      return;
    }

    const timer = window.setTimeout(() => setNewConfessionEntering(false), 900);
    return () => window.clearTimeout(timer);
  }, [newConfessionEntering]);

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
      const minLoading = new Promise((resolve) => window.setTimeout(resolve, SAVE_LOADING_MIN_DURATION_MS));
      const response = await fetch(`/api/confessions/draft/${draft.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedImageUrl }),
      });

      if (!response.ok) {
        throw new Error(await responseError(response));
      }

      const body = (await response.json()) as { confession: Confession };
      await minLoading;
      setConfessions((items) => [body.confession, ...items.filter((item) => item.id !== body.confession.id)]);
      setFilterOptions((options) => ({
        countries: [
          ...options.countries,
          ...[body.confession.country, ...body.confession.tags.filter((tag) => !options.topics.includes(tag) && tag !== "אחר")].filter(
            (value) => value && !options.countries.includes(value),
          ),
        ],
        topics: options.topics.includes(body.confession.topic) ? options.topics : [...options.topics, body.confession.topic],
      }));
      setNewConfession(body.confession);
      setNewConfessionEntering(true);
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

  function handleRatingCommit(value: number) {
    setFlashRating(value);
    window.setTimeout(() => setFlashRating(undefined), 1200);
  }

  function resetFilters() {
    setSearch("");
    setCountry("");
    setTopic("");
    setSort("random");
    setShuffleNonce((value) => value + 1);
  }

  function handleSortChange(value: SortValue) {
    if (value === "random") {
      resetFilters();
      return;
    }

    setSort(value);
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
          onRatingCommit={handleRatingCommit}
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
          <Modal title="בדוק?" onCancel={() => setShowCancelConfirm(false)} onConfirm={() => void handleCancelDraft()}>
            פעולה זו תוביל למחיקת הוידוי שלך לנצח נצחים (בלי לחץ)
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
      showSplashIntro={showSplashIntro}
      showSuccess={screen === "success" && showSuccessToast}
      newConfession={newConfession}
      newConfessionEntering={newConfessionEntering}
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
      onSplashIntroDone={hideSplashIntro}
      onDismissSuccess={() => setShowSuccessToast(false)}
      onSearchChange={setSearch}
      onCountryChange={setCountry}
      onTopicChange={setTopic}
      onSortChange={handleSortChange}
      onResetFilters={resetFilters}
    />
  );
}
