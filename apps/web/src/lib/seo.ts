import { globalNoindex } from "@penta/publishing-core";
import type { Metadata } from "next";

export function pageMeta(input: {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
}): Metadata {
  const noindex = input.noindex || globalNoindex();
  return {
    title: input.title,
    description: input.description,
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: input.canonical },
  };
}
