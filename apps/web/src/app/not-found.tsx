import Link from "next/link";
import { previewHomePath, previewProduct } from "@/lib/preview-product";

export default function NotFound() {
  const home = previewHomePath();
  const preview = previewProduct();
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl">That page is not in the catalog.</h1>
      <p className="mt-4 leading-7">
        Missing entities are collected as demand signals. We do not generate a filler article to occupy the URL.
      </p>
      <Link href={home} className="mt-8 inline-block underline">
        {preview ? `Back to ${preview}` : "Back to the five products"}
      </Link>
    </main>
  );
}
