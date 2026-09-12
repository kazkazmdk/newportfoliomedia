import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl">That page is not in the catalog.</h1>
      <p className="mt-4 leading-7">
        Missing entities are collected as demand signals. We do not generate a filler article to occupy the URL.
      </p>
      <Link href="/" className="mt-8 inline-block underline">
        Back to the five products
      </Link>
    </main>
  );
}
