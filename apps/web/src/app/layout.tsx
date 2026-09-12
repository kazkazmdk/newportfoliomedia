import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { globalNoindex } from "@penta/publishing-core";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Penta — five decision engines",
    template: "%s",
  },
  description:
    "FixCode, AutoSpec, WearThere, ChargeMatch, and TripCost — consumer decision engines, not blogs.",
  robots: globalNoindex()
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
