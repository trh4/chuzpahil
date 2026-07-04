import type { Metadata } from "next";
import { haimG, ploni, ploniYad } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "חוצפה איי.אל",
  description: "וידויים של ישראלים בחו״ל שהם רמה גבוהה של רמה נמוכה",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${ploni.variable} ${ploniYad.variable} ${haimG.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
