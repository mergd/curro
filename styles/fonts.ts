import { cn } from "@/lib/utils";

import { Inter, Source_Serif_4 } from "next/font/google";
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const berkeleyMono = localFont({
  src: [
    {
      path: "./fonts/berkeley-mono/BerkeleyMono-reg.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/berkeley-mono/BerkeleyMono-reg-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-berkeley-mono",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif-4",
});

export const fonts = cn(
  berkeleyMono.variable,
  sourceSerif4.variable,
  inter.variable,
  "font-sans antialiased",
);
