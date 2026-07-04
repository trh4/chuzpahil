import localFont from "next/font/local";

export const ploni = localFont({
  src: [
    {
      path: "./fonts/ploni-regular-aaa.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ploni-demibold-aaa.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/ploni-bold-aaa.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ploni",
  display: "swap",
});

export const ploniYad = localFont({
  src: "./fonts/ploni-yad-medium-aaa.otf",
  weight: "500",
  variable: "--font-ploni-yad",
  display: "swap",
});

export const haimG = localFont({
  src: "./fonts/HaimG-BoldSoft.otf",
  weight: "700",
  variable: "--font-haim",
  display: "swap",
});
