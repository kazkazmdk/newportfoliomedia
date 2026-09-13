import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FOLIO_DESCRIPTION, FOLIO_TITLE } from "@/lib/folio-metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: FOLIO_TITLE,
  description: FOLIO_DESCRIPTION,
  authors: [{ name: "Lissandre Pasdeloup" }],
  openGraph: {
    title: FOLIO_TITLE,
    description: FOLIO_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: FOLIO_TITLE,
    description: FOLIO_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${inter.className} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
