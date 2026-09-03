import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const geistSans = GeistSans; // exposes className + variable "--font-geist-sans"
export const geistMono = GeistMono; // exposes className + variable "--font-geist-mono"

export const fontVariables = `${pretendard.variable} ${GeistSans.variable} ${GeistMono.variable}`;
