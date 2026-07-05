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
  splashIntroVideo: "/videos/splash-intro.mp4",
  tour: imagePaths.tour,
  waterpark: imagePaths.waterpark,
} as const;

const SPLASH_INTRO_DURATION_MS = 2200;
const REDUCED_MOTION_SPLASH_DURATION_MS = 180;

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

const extraCollagePositions = [
  { className: "left-[4%] top-[8%] w-[42vw] lg:left-[10%] lg:w-[19vw]", rotate: "-rotate-[13deg]" },
  { className: "left-[54%] top-[2%] w-[49vw] lg:left-[42%] lg:w-[17vw]", rotate: "rotate-[10deg]" },
  { className: "left-[23%] top-[28%] w-[38vw] lg:left-[67%] lg:top-[10%] lg:w-[21vw]", rotate: "rotate-[19deg]" },
  { className: "left-[-10%] top-[48%] w-[54vw] lg:left-[22%] lg:top-[45%] lg:w-[23vw]", rotate: "rotate-[8deg]" },
  { className: "left-[48%] top-[58%] w-[45vw] lg:left-[54%] lg:top-[42%] lg:w-[18vw]", rotate: "-rotate-[17deg]" },
  { className: "left-[16%] top-[78%] w-[46vw] lg:left-[78%] lg:top-[61%] lg:w-[16vw]", rotate: "rotate-[14deg]" },
];

// Positions are percentages of the page, sizes are relative to the viewport
// width, so the collage scales continuously with any screen size.
// Mobile layout matches Figma frame 1334:719 (390x844).
const mobileCollage: CollageImage[] = [
  {
    src: images.cafe,
    alt: "Illustration of travelers at a cafe",
    confessionId: "souvenir-mugs",
    className: "left-[-15.2%] top-[3.2%] w-[68.5vw]",
    rotate: "-rotate-[16.43deg]",
    priority: true,
  },
  {
    src: images.waterpark,
    alt: "Illustration of a water park scene",
    confessionId: "bracelet",
    className: "left-[59.7%] top-[3%] w-[67.4vw]",
    rotate: "rotate-[20.07deg]",
    priority: true,
  },
  {
    src: images.hostel,
    alt: "Illustration of a masked tourist",
    confessionId: "train",
    className: "left-[-14.6%] top-[26.7%] w-[38.5vw]",
    rotate: "-rotate-[31.18deg]",
  },
  {
    src: images.flipflops,
    alt: "Illustration of a traveler on red hoverboards",
    confessionId: "honeymoon",
    className: "left-[72.3%] top-[29.6%] w-[41vw]",
    rotate: "-rotate-[17.95deg]",
  },
  {
    src: images.dorm,
    alt: "Illustration of travelers sleeping in a shared room",
    confessionId: "budget-room",
    className: "left-[-25.6%] top-[45.4%] w-[54.9vw]",
    rotate: "-rotate-[12.83deg]",
  },
  {
    src: images.beach,
    alt: "Illustration of tourists on a beach",
    confessionId: "honeymoon",
    className: "left-[53.6%] top-[56.2%] w-[91.4vw]",
    rotate: "rotate-[13.47deg]",
  },
  {
    src: images.marathon,
    alt: "Illustration of a runner abroad",
    confessionId: "marathon",
    className: "left-[-37.2%] top-[63.9%] w-[84.1vw]",
    rotate: "rotate-[21.36deg]",
  },
  {
    src: images.tour,
    alt: "Illustration of a tour group",
    confessionId: "gozleme",
    className: "left-[46.4%] top-[84.1%] w-[44.4vw]",
    rotate: "-rotate-[20.55deg]",
  },
];

// Laptop (lg) layout matches Figma frame 1118:38187 (1280x832),
// wide desktop (2xl) matches Figma frame 1357:2020 (1920x1080).
const desktopCollage: CollageImage[] = [
  {
    src: images.cafe,
    alt: "Illustration of travelers at a cafe",
    confessionId: "souvenir-mugs",
    className: "left-[4.8%] top-[-0.5%] w-[36.3vw] 2xl:left-[9.1%] 2xl:top-[-0.7%] 2xl:w-[30vw]",
    rotate: "rotate-[11.58deg]",
    priority: true,
  },
  {
    src: images.flipflops,
    alt: "Illustration of a traveler on red hoverboards",
    confessionId: "honeymoon",
    className: "left-[51.3%] top-[5.2%] w-[21.8vw] 2xl:left-[56.9%] 2xl:top-[10.1%] 2xl:w-[17.4vw]",
    rotate: "rotate-[25.36deg]",
  },
  {
    src: images.waterpark,
    alt: "Illustration of a water park scene",
    confessionId: "bracelet",
    className: "left-[65.7%] top-[-7.5%] w-[37.1vw] 2xl:left-[68.4%] 2xl:top-[-1.6%] 2xl:w-[29.6vw]",
    rotate: "-rotate-[9.89deg]",
    priority: true,
  },
  {
    src: images.hostel,
    alt: "Illustration of a masked tourist",
    confessionId: "train",
    className: "left-[-7.7%] top-[15.3%] w-[22.6vw] 2xl:left-[-1.3%] 2xl:top-[14.4%] 2xl:w-[18.7vw]",
    rotate: "-rotate-[19.05deg]",
  },
  {
    src: images.marathon,
    alt: "Illustration of a runner abroad",
    confessionId: "marathon",
    className: "left-[82.5%] top-[72.7%] w-[22.2vw] 2xl:left-[84.3%] 2xl:top-[77.4%] 2xl:w-[17.7vw]",
    rotate: "-rotate-[15deg]",
  },
  {
    src: images.beach,
    alt: "Illustration of tourists on a beach",
    confessionId: "honeymoon",
    className: "left-[64.4%] top-[52.8%] w-[33.1vw] 2xl:left-[62.5%] 2xl:top-[54.4%] 2xl:w-[31.9vw]",
    rotate: "rotate-[13.47deg]",
  },
  {
    src: images.dorm,
    alt: "Illustration of travelers sleeping in a shared room",
    confessionId: "budget-room",
    className: "left-[-1.9%] top-[55.4%] w-[36.7vw] 2xl:left-[2.8%] 2xl:top-[51.4%] 2xl:w-[33.5vw]",
    rotate: "-rotate-[15deg] 2xl:-rotate-[13.94deg]",
  },
  {
    src: images.tour,
    alt: "Illustration of a tour group",
    confessionId: "gozleme",
    className: "left-[47.2%] top-[74.3%] w-[22.2vw] 2xl:left-[52.3%] 2xl:top-[76.9%] 2xl:w-[20.9vw]",
    rotate: "rotate-[8.85deg]",
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
  onClick,
}: CollageImage & {
  faded?: boolean;
  shrunk?: boolean;
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
      className={`absolute flex aspect-square items-center justify-center transition-transform duration-500 ease-out hover:z-20 hover:scale-110 ${
        shrunk ? "scale-[0.86]" : ""
      } ${className}`}
      style={style}
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
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={triggerClassName}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {renderTrigger ? renderTrigger(selectedLabel, open) : selectedLabel}
      </button>
      {open ? (
        <div role="listbox" aria-label={ariaLabel} className={panelClassName} dir="rtl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={optionClassName}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
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

  return (
    <header
      className="relative z-30 flex h-[clamp(50px,6.5vw,83px)] w-full items-center justify-between overflow-visible border-b border-[#eae5e3] bg-[#fffaf0] px-[clamp(18px,7.2vw,92px)] py-[clamp(10px,1.1vw,13px)]"
      dir="ltr"
    >
      <label
        className={`flex min-w-0 items-center rounded-full transition-colors ${
          mobileSearchOpen
            ? "w-[min(72vw,290px)] justify-between border border-[blue] px-[10px] py-[4px]"
            : "justify-center p-[6px]"
        } lg:w-[clamp(290px,29.5vw,567px)] lg:justify-between lg:border lg:px-[clamp(15px,1.2vw,22px)] lg:py-[clamp(6px,0.55vw,10px)] ${
          searchActive ? "lg:border-[blue]" : "lg:border-[#998e8a]"
        }`}
        onClick={() => {
          if (!mobileSearchOpen) {
            setMobileSearchOpen(true);
          }
        }}
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
          className={`${mobileSearchOpen ? "block text-[12px]" : "hidden"} min-w-0 flex-1 bg-transparent text-right font-sans text-[#745447] placeholder:text-[#745447] focus:outline-none lg:block lg:text-[18px] 2xl:text-[24px]`}
        />
      </label>

      <nav className={`${mobileSearchOpen ? "hidden" : "flex"} min-w-0 items-center justify-end gap-[clamp(18px,4.9vw,63px)] lg:flex`} dir="rtl">
        <CustomDropdown
          value={sort}
          ariaLabel="Sort confessions"
          options={sortOptions}
          onChange={onSortChange}
          triggerClassName="flex shrink-0 items-center justify-center gap-1 bg-transparent font-sans text-[14px] text-[#0013be] focus:outline-none lg:gap-[6px] lg:text-[16px] 2xl:gap-2 2xl:text-[24px]"
          panelClassName={dropdownPanelClass}
          optionClassName={dropdownOptionClass}
          renderTrigger={(label) => (
            <>
              <span>{label}</span>
              <span className="relative h-2 w-1 -rotate-90 lg:h-[11px] lg:w-[6px] 2xl:h-[14.6px] 2xl:w-[8.6px]">
                <Image src={images.arrow} alt="" fill sizes="15px" />
              </span>
            </>
          )}
        />

        <div className="flex min-w-0 items-center gap-[5px]">
          <span className="relative size-[14px] shrink-0 lg:size-[clamp(16px,1.3vw,24.873px)]">
            <Image src={images.discoverTune} alt="" fill sizes="25px" />
          </span>
          <div className="flex items-center gap-1.5 lg:gap-[clamp(10px,0.75vw,14px)]">
            <CustomDropdown
              value={country}
              ariaLabel="Filter by country"
              options={countryDropdownOptions}
              onChange={onCountryChange}
              triggerClassName={filterClass(Boolean(country))}
              panelClassName={`${dropdownPanelClass} overflow-hidden rounded-[10px]`}
              optionClassName={dropdownOptionClass}
              renderTrigger={(label) => <span className="w-full text-center">{country ? label : "מדינה"}</span>}
            />
            <CustomDropdown
              value={topic}
              ariaLabel="Filter by topic"
              options={topicDropdownOptions}
              onChange={onTopicChange}
              triggerClassName={filterClass(Boolean(topic))}
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
  const promptActive = promptFocused || prompt.length > 0;

  return (
    <section className="sticky top-[185px] z-20 mx-auto mt-[270px] flex w-full max-w-[1046px] flex-col items-center gap-[9px] px-5 lg:top-[226px] lg:mt-[309px] lg:gap-[19px] 2xl:top-[290px] 2xl:mt-[373px]">
      <div className="flex w-full flex-col items-center gap-[14px] lg:gap-[19px] 2xl:gap-[28px]">
        <div className="flex flex-col items-center">
          <div className="relative aspect-482/196 w-[186.593px] lg:w-[273px] 2xl:w-[482px]">
            <Image src={images.logo} alt="Chutzpah" fill priority sizes="(min-width: 1024px) 482px, 190px" />
          </div>
          <p className="font-ploni-yad mt-[-0.05em] text-center text-[50px] leading-none text-[#2b2b2b] lg:text-[72.668px] 2xl:text-[128.309px]">
            איי.אל
          </p>
        </div>

        <p className="max-w-[195px] text-center text-[14px] leading-[1.16] text-[#2b2b2b] lg:max-w-[323px] lg:text-[20px] 2xl:max-w-[1046px] 2xl:text-[24px]">
          ווידויים של ישראלים בחו״ל שהם רמה גבוהה של רמה נמוכה
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        id="hero-prompt-form"
        className={`flex w-full max-w-[min(92vw,1046px)] items-center justify-end overflow-hidden rounded-full border-2 bg-[#fffcf8] px-[clamp(16px,2vw,40px)] py-[clamp(7px,0.75vw,14.5px)] transition-colors ${
          promptActive
            ? "border-[#2b2b2b] shadow-[6px_4px_10.2px_0px_rgba(0,0,0,0.25),70px_15px_43px_0px_rgba(0,0,0,0.05),31px_7px_32px_0px_rgba(0,0,0,0.09),8px_2px_17px_0px_rgba(0,0,0,0.1)]"
            : "border-[blue] shadow-[6px_4px_10.2px_0px_rgba(0,0,255,0.25),70px_15px_43px_0px_rgba(0,0,0,0.05),31px_7px_32px_0px_rgba(0,0,0,0.09),8px_2px_17px_0px_rgba(0,0,0,0.1)]"
        }`}
      >
        <span className="flex w-full items-center justify-end gap-[7px] lg:gap-[19.52px] 2xl:gap-[26px]" dir="rtl">
          <button
            type="button"
            onClick={onHelp}
            className={`relative flex size-[30px] shrink-0 items-center justify-center rounded-[6.563px] p-[2.813px] transition-colors hover:bg-[#d1e2ff] lg:size-[42px] lg:p-[3.938px] 2xl:size-[53px] ${
              isHelpOpen ? "bg-[#d1e2ff]" : ""
            }`}
            aria-label="Prompt writing instructions"
            aria-pressed={isHelpOpen}
          >
            <span className="relative size-[24.375px] lg:size-[34.125px] 2xl:size-[44.817px]">
              <Image
                src={images.menuBook}
                alt=""
                fill
                sizes="45px"
                className={isHelpOpen ? "brightness-0" : undefined}
              />
            </span>
          </button>
          <input
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            onFocus={() => setPromptFocused(true)}
            onBlur={() => setPromptFocused(false)}
            placeholder={promptActive ? "" : "לא להתבייש! כתבו על סיטואציה בה הייתם קצת הישראלי המכוער בחול...."}
            dir="rtl"
            className="min-w-0 flex-1 overflow-hidden bg-transparent text-right font-sans text-[14px] text-ellipsis whitespace-nowrap text-[#2b2b2b] placeholder:text-[#998e8a] focus:outline-none lg:text-[20px] 2xl:text-[24px]"
          />
        </span>
      </form>
      {isHelpOpen ? <InstructionsCard onClose={onHelp} /> : null}
      {error ? (
        <div className="fixed left-1/2 top-1/2 z-50 flex w-[min(86vw,348px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[10px] rounded-[13.127px] border-2 border-[#a90e25] bg-[#ffe4d7] px-8 py-[27.566px] text-center drop-shadow-[128px_74px_20.5px_rgba(0,0,0,0),82px_47px_19px_rgba(0,0,0,0.01),46px_27px_16px_rgba(0,0,0,0.05),21px_12px_12px_rgba(0,0,0,0.09),5px_3px_6.5px_rgba(0,0,0,0.1)]">
          <strong className="font-haim text-[40px] leading-none text-[#a90e25]">לא משהו...</strong>
          <span className="text-[14px] leading-[1.2] text-[#2b2b2b] lg:text-[18px] 2xl:text-[20px]">{error}</span>
        </div>
      ) : null}
    </section>
  );
}

function SplashIntro({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
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
    const timer = window.setTimeout(finish, reduceMotion || videoFailed ? REDUCED_MOTION_SPLASH_DURATION_MS : SPLASH_INTRO_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [finish, videoFailed]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-25 flex items-center justify-center bg-[#fffaf0] px-[clamp(20px,6vw,72px)] transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {videoFailed ? (
        <div
          data-figma-name="פתיח אתר 4"
          data-figma-node-id="1406:579"
          className="splash-intro-panel aspect-1121/631 w-full max-w-[1121px] rounded-[clamp(28px,4vw,58px)] bg-[#fffaf0]"
        />
      ) : (
        <video
          data-figma-name="פתיח אתר 4"
          data-figma-node-id="1406:579"
          className="aspect-1121/631 w-full max-w-[1121px] rounded-[clamp(28px,4vw,58px)] bg-[#fffaf0] object-cover"
          autoPlay
          muted
          playsInline
          onEnded={finish}
          onError={() => setVideoFailed(true)}
        >
          <source src={images.splashIntroVideo} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

function Collage({
  items,
  faded = false,
  shrinkIndex,
  onOpenDetail,
}: {
  items: CollageImage[];
  faded?: boolean;
  shrinkIndex?: number;
  onOpenDetail?: (id: string) => void;
}) {
  return (
    <>
      {items.map((item, index) => (
        <FloatingIllustration
          key={`${item.src}-${item.className}`}
          {...item}
          faded={faded}
          shrunk={index === shrinkIndex}
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
  onOpenDetail,
}: {
  confessions: Confession[];
  onOpenDetail: (id: string) => void;
}) {
  if (confessions.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10 mx-auto mt-[min(34dvh,300px)] h-[calc(120vw+160px)] min-h-[720px] w-full pb-20 lg:h-[820px] 2xl:h-[980px]">
      {confessions.map((confession, index) => {
        const position = extraCollagePositions[index % extraCollagePositions.length];

        return (
          <FloatingIllustration
            key={confession.id}
            src={confession.image}
            alt={confession.title}
            confessionId={confession.id}
            className={position.className}
            rotate={position.rotate}
            onClick={() => onOpenDetail(confession.id)}
          />
        );
      })}
    </section>
  );
}

function NewConfessionIllustration({ confession }: { confession: Confession }) {
  return (
    <div className="absolute left-[5%] top-[42%] z-10 flex aspect-square w-[64vw] animate-[passportIn_1000ms_ease-out] items-center justify-center lg:left-[18%] lg:top-[58%] lg:w-[24.5vw]">
      <div className="relative aspect-square w-[81%] rotate-[-15.76deg] overflow-hidden shadow-[0.9vw_1vw_0.7vw_-0.3vw_rgba(0,0,0,0.25)]">
        <Image src={confession.image} alt={confession.title} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 64vw" />
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
    <div className="relative min-h-dvh w-full flex-1 overflow-y-auto overflow-x-hidden bg-[#fffaf0] font-sans text-[#2b2b2b]" dir="rtl">
      {children}
    </div>
  );
}

function TagPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#998e8a] px-2 py-0.5 font-sans text-[14px] text-[#745447] lg:text-[18px] 2xl:text-[24px]">
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
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const value = Math.max(0, Math.min(100, rating));
  const showValue = hovering || dragging;

  return (
    <div className="flex w-[296px] flex-col items-end justify-center gap-2 lg:w-[760px] lg:flex-row lg:items-end lg:gap-[22px] 2xl:w-[1040px]">
      <p className="shrink-0 text-right text-[14px] font-bold lg:pb-[2px] lg:text-[20px] 2xl:text-[26px]">דרג.י בחוצפמטר:</p>
      <div
        className="relative h-[63px] w-full max-w-[470px] lg:max-w-none"
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
      >
        {showValue ? (
          <span
            className="absolute top-0 z-10 h-[27px] min-w-[48px] -translate-x-1/2 rounded-[5px] bg-white px-2 text-center text-[14px] leading-[27px] text-black shadow-[1px_1px_4px_rgba(0,0,0,0.25)] lg:text-[18px]"
            style={{ left: `calc(${value}% + ${14.5 - value * 0.29}px)` }}
          >
            {value}%
          </span>
        ) : null}
        <div className="absolute left-0 top-[39px] h-5 w-full overflow-hidden rounded-[20px] border border-[blue] bg-[#fffcf8]">
          <div className="h-full rounded-[20px] bg-[#d1e2ff]" style={{ width: `${value}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={value}
          onPointerDown={() => setDragging(true)}
          onPointerUp={(event) => {
            setDragging(false);
            onRatingCommit?.(Number(event.currentTarget.value));
          }}
          onChange={(event) => onRatingChange?.(Number(event.target.value))}
          className="chutzpah-range absolute left-0 top-[33px] h-[29px] w-full"
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
          ? "relative z-20 mx-auto mt-[80px] flex w-[342px] flex-col items-center gap-[22px] pb-10 lg:absolute lg:left-1/2 lg:top-1/2 lg:mt-0 lg:w-[min(86vw,1013px)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:pb-0 2xl:w-[1390px]"
          : "relative z-20 mx-auto mt-[55px] flex w-[342px] flex-col items-center gap-[16px] pb-10 lg:absolute lg:left-1/2 lg:top-1/2 lg:mt-0 lg:w-[min(86vw,1013px)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:pb-0 2xl:w-[1390px]"
      }
    >
      <article
        className="flex w-full flex-col items-center bg-[#fffcf8] pb-5 text-right drop-shadow-[4px_4px_3.3px_rgba(0,0,0,0.25)] lg:h-[620px] lg:flex-row lg:items-stretch lg:justify-center lg:pb-0 2xl:h-[720px]"
        dir="ltr"
      >
        <div
          className={`relative h-[364px] w-full overflow-hidden lg:h-full lg:basis-[61.2%] 2xl:basis-[58.1%] ${
            isPreview && selectedPreviewImageIndex === previewImageIndex ? "ring-4 ring-[blue]" : ""
          }`}
        >
          <Image src={image} alt={confession.title} fill priority className="object-cover" sizes="342px" />
          {isPreview ? (
            <button
              type="button"
              onClick={() => setSelectedPreviewImageIndex(previewImageIndex)}
              className="absolute inset-0 z-10 cursor-pointer"
              aria-label="Select this preview image"
            />
          ) : null}
          {flashRating !== undefined ? (
            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-[6.837px] bg-[#fffcf8] px-[30px] py-[13px] text-[27px] font-bold text-[#2b2b2b] shadow-[3px_3px_18px_rgba(0,0,0,0.18)]">
              {flashRating}%
            </div>
          ) : null}
          {!isPreview ? (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-[14px] top-[10px] z-20 flex size-[42px] items-center justify-center text-[32px] leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] lg:hidden"
              aria-label="Close"
            >
              ×
            </button>
          ) : null}
          {isPreview ? (
            <>
              <div className="absolute inset-x-0 bottom-0 h-[76px] bg-linear-to-b from-transparent to-[rgba(0,0,0,0.7)]" />
              <div className="absolute bottom-[17px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-[108px] text-[34px] leading-none text-white lg:gap-[218.63px]">
                <button
                  type="button"
                  onClick={() => setPreviewImageIndex((value) => (value + previewImages.length - 1) % previewImages.length)}
                  aria-label="Previous preview image"
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                >
                  ←
                </button>
                <span className="flex items-center gap-1">
                  {previewImages.map((option, index) => (
                    <span
                      key={`${option}-${index}`}
                      className={`block rounded-full ${index === previewImageIndex ? "size-[14px] bg-white" : "size-[9px] bg-white/55"}`}
                    />
                  ))}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImageIndex((value) => (value + 1) % previewImages.length)}
                  aria-label="Next preview image"
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                >
                  →
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-5 flex w-[292px] flex-col items-end gap-4 lg:m-0 lg:h-full lg:basis-[38.8%] lg:justify-start lg:px-[70px] lg:py-[20px] 2xl:basis-[41.9%] 2xl:px-[86px] 2xl:py-[40px]" dir="rtl">
          <button
            type="button"
            onClick={onClose}
            className="mb-1 hidden size-[63px] items-center justify-center self-end text-[60px] leading-none text-[#2b2b2b] lg:flex"
            aria-label="Close"
          >
            ×
          </button>
          <div className="flex w-full flex-col items-end gap-[13px]">
            <div className="flex w-full flex-col items-end gap-1.5">
              {isPreview ? <p className="text-[14px] text-[blue] lg:text-[20px] 2xl:text-[24px]">תצוגה לפני פרסום</p> : null}
              <div className="flex w-full flex-col items-end gap-0.5">
                <h1 className="font-haim text-[26px] leading-none text-[blue] lg:text-[36px] 2xl:text-[52px]">{confession.title}</h1>
                <p className="text-[14px] text-[#868686] lg:text-[18px] 2xl:text-[24px]">{confession.date}</p>
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
          <div className="mt-auto flex w-full flex-col items-end gap-2">
            <span className="hidden font-bold text-[#2b2b2b] lg:block lg:text-[18px] 2xl:text-[24px]">תגים:</span>
            <div className="flex w-full flex-wrap items-center justify-end gap-2">
              {confession.tags.map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </div>
          </div>
        </div>
      </article>

      {isPreview ? (
        <div className="flex items-center gap-[10px] lg:mt-1">
          <button
            type="button"
            onClick={() => onPublish?.(selectedImage)}
            className="flex w-[101px] items-center justify-center gap-[6px] rounded-[50.116px] bg-[blue] px-5 py-[5px] text-[20px] font-semibold text-[#fffcf8] transition-colors hover:bg-[#0010a8] 2xl:w-[134px] 2xl:text-[24px]"
            dir="rtl"
          >
            <span className="leading-none">↑</span>
            <span>פרסום</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#998e8a] px-[18px] py-[5px] text-[20px] text-[#2b2b2b] transition-colors hover:bg-[#eae5e3] 2xl:text-[24px]"
          >
            ביטול
          </button>
          {actionError ? <p className="max-w-[300px] text-right text-[14px] text-[blue] lg:text-[18px] 2xl:text-[24px]">{actionError}</p> : null}
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
  const loadingText = isSuitcase ? "מוסיף את הוידוי שלך" : "מעמיס רגע כמה נתונים";

  if (isCroissants) {
    return (
      <ScreenCanvas>
        <Backdrop />
        <div className="absolute left-1/2 top-1/2 z-20 flex h-[67dvh] w-[min(92vw,67vw)] min-w-[342px] max-w-[895px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[10px] bg-[#fefdf8] px-[clamp(24px,8vw,211px)] pb-[42px] pt-[35px] drop-shadow-[204px_141px_34.5px_rgba(0,0,0,0),130px_90px_32px_rgba(0,0,0,0.01),73px_51px_27px_rgba(0,0,0,0.05),33px_23px_20px_rgba(0,0,0,0.09),8px_6px_11px_rgba(0,0,0,0.1)]">
          <video
            className="min-h-0 w-full flex-1 object-contain"
            data-figma-name="לופ העמסת מזון"
            data-figma-node-id="1115:31631"
            autoPlay
            loop
            muted
            playsInline
            poster={images.loadingCroissantsPoster}
            preload="auto"
            aria-hidden="true"
          >
            <source src={images.loadingCroissantsVideo} type="video/mp4" />
          </video>
          <p className="text-center text-[20px] text-[#2b2b2b] lg:text-[24px] 2xl:text-[30px]">
            {loadingText}
            <span className="loading-dots" aria-hidden="true" />
          </p>
        </div>
      </ScreenCanvas>
    );
  }

  return (
    <ScreenCanvas>
      <Backdrop />
      <div className="absolute left-1/2 top-1/2 z-20 flex h-[67dvh] w-[min(92vw,67vw)] min-w-[342px] max-w-[895px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[10px] bg-[#fefdf8] px-[clamp(24px,8vw,211px)] pb-[42px] pt-[35px] drop-shadow-[204px_141px_34.5px_rgba(0,0,0,0),130px_90px_32px_rgba(0,0,0,0.01),73px_51px_27px_rgba(0,0,0,0.05),33px_23px_20px_rgba(0,0,0,0.09),8px_6px_11px_rgba(0,0,0,0.1)]">
        <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-[#fffcf8]">
          <Image src={src} alt="" fill priority className="object-cover" sizes="596px" />
        </div>
        <p className="text-center text-[20px] text-[#2b2b2b] lg:text-[24px] 2xl:text-[30px]">
          {loadingText}
          <span className="loading-dots" aria-hidden="true" />
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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/25 px-6">
      <div className="flex w-[330px] flex-col items-center gap-[10px] rounded-[13.127px] border-2 border-[#fbb03b] bg-[#fff9de] px-8 py-7 text-center drop-shadow-[128px_74px_20.5px_rgba(0,0,0,0),82px_47px_19px_rgba(0,0,0,0.01),46px_27px_16px_rgba(0,0,0,0.05),21px_12px_12px_rgba(0,0,0,0.09),5px_3px_6.5px_rgba(0,0,0,0.1)] lg:w-[466px] lg:px-[78px] 2xl:w-[560px]">
        <h2 className="font-haim text-[40px] leading-none text-[#fbb03b]">{title}</h2>
        <div className="text-[20px] leading-[0.98] text-[#2b2b2b]">{children}</div>
        <div className="flex gap-3">
          {onConfirm ? (
            <button type="button" onClick={onConfirm} className="rounded-full border border-[#998e8a] px-[18px] py-[5px] text-[20px] text-[#2b2b2b] transition-colors hover:bg-[#eae5e3]">
              למחוק
            </button>
          ) : null}
          <button type="button" onClick={onCancel} className="rounded-full bg-[blue] px-5 py-[5px] text-[20px] font-semibold text-[#fffcf8] transition-colors hover:bg-[#0010a8]">
            להישאר
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute left-1/2 top-[65%] z-30 flex -translate-x-1/2 flex-col items-center gap-3 rounded-[18px] border border-[#998e8a] bg-[#fffcf8]/95 px-6 py-5 text-center shadow-[6px_6px_18px_rgba(0,0,0,0.15)]">
      <p className="text-[16px] text-[#2b2b2b] lg:text-[20px] 2xl:text-[24px]">לא נמצאו וידויים מתאימים</p>
      <button type="button" onClick={onReset} className="rounded-full bg-[blue] px-5 py-1.5 text-[14px] text-[#fffcf8] lg:text-[18px] 2xl:text-[24px]">
        איפוס סינון
      </button>
    </div>
  );
}

function InstructionsContent() {
  const rows = [
    ["✓", "תנו ג׳וס- תארו מה עשיתם, איפה? למה? כמה? עם מי? ומה עבר לכם בראש", "text-[#61a605]"],
    ["✓", "תהיו ספציפיים- ככל שתהיו ספציפיים וכנים יותר התוצאה תהיה מדויקת יותר", "text-[#61a605]"],
    ["×", "לא להתקמצן במידע... משפט אחד/ כמה מילים לא נחשבות לוידוי", "text-[red]"],
    ["!", "שגר ושכח! תחשבו טוב טוב לפני שאתם מפרסמים... אין דרך חזרה!", "text-[#fbb03b]"],
  ];

  return (
    <>
      <h2 className="font-haim text-[20px] text-[#020202] lg:text-[24px] 2xl:text-[30px]">איך לכתוב וידוי טוב?</h2>
      <div className="flex flex-col gap-[6px]">
        {rows.map(([icon, text, color]) => (
          <p
            key={text}
            className="flex items-center justify-end gap-[18px] text-right text-[14px] leading-[1.477] text-[#2b2b2b] lg:text-[20px]"
            dir="ltr"
          >
            <span dir="rtl">{text}</span>
            <span className={`flex w-[19px] shrink-0 items-center justify-center font-bold ${color}`}>{icon}</span>
          </p>
        ))}
      </div>
    </>
  );
}

function InstructionsCard({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="relative z-40 mt-[10px] flex w-full max-w-[min(92vw,1046px)] flex-col items-end gap-[9px] rounded-[28px] border-2 border-[#eae5e3] bg-[#fffcf8] px-5 py-5 text-right shadow-[4px_4px_12px_rgba(0,0,0,0.18)] lg:px-[71px]"
      dir="rtl"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute left-4 top-3 text-[24px] leading-none text-[#2b2b2b] lg:hidden"
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
  const collageConfessions = newConfession
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
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#fffaf0] font-sans text-[#2b2b2b]"
      dir="rtl"
    >
      {renderHeader()}
      <main className="relative min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden" aria-label="Homepage hero">
        <div className="absolute inset-x-0 bottom-0 -top-[clamp(50px,6.5vw,83px)] z-0 lg:hidden">
          <Collage items={mobileItems} shrinkIndex={newConfession ? 4 : undefined} onOpenDetail={onOpenDetail} />
        </div>
        <div className="absolute inset-x-0 bottom-0 -top-[clamp(50px,6.5vw,83px)] z-0 hidden lg:block">
          <Collage items={desktopItems} shrinkIndex={newConfession ? 6 : undefined} onOpenDetail={onOpenDetail} />
        </div>
        {newConfession ? <NewConfessionIllustration confession={newConfession} /> : null}
        <HeroContent
          prompt={prompt}
          error={error}
          isHelpOpen={Boolean(showInstructions)}
          onPromptChange={onPromptChange}
          onSubmit={onSubmit}
          onHelp={onHelp}
        />
        {showSplashIntro ? <SplashIntro onDone={onSplashIntroDone} /> : null}
        {showSuccess ? <SuccessToast onDismiss={onDismissSuccess} /> : null}
        {hasNoResults ? <EmptyState onReset={onResetFilters} /> : null}
        <ExtraConfessionsGrid confessions={collageConfessions.slice(8)} onOpenDetail={onOpenDetail} />
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
  const [showSplashIntro, setShowSplashIntro] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const visibleConfessions = confessions;
  const countries = [...countryOptions];
  const topics = [...topicOptions];
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
      onSortChange={setSort}
      onResetFilters={resetFilters}
    />
  );
}
