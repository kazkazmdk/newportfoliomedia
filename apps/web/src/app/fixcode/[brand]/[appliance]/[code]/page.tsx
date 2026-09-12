import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_ERRORS, ALL_SYMPTOMS, getError, getSymptom } from "@penta/fixcode";
import { allFixcodePages } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";

export function generateStaticParams() {
  const errors = ALL_ERRORS.map((item) => ({
    brand: item.brand_slug,
    appliance: item.appliance_slug,
    code: item.code_slug,
  }));
  const symptoms = ALL_SYMPTOMS.filter((item) => item.brand_slug).map((item) => ({
    brand: item.brand_slug!,
    appliance: item.appliance_slug,
    code: item.symptom_slug,
  }));
  return [...errors, ...symptoms];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; appliance: string; code: string }>;
}) {
  const { brand, appliance, code } = await params;
  const page = allFixcodePages().find((item) => item.url === `/fixcode/${brand}/${appliance}/${code}`);
  if (!page) return {};
  return pageMeta({
    title: page.title,
    description: page.meta_description,
    canonical: page.canonical,
    noindex: page.noindex,
  });
}

export default async function ErrorPage({
  params,
}: {
  params: Promise<{ brand: string; appliance: string; code: string }>;
}) {
  const { brand, appliance, code } = await params;
  const error = getError(brand, appliance, code);
  const symptom = getSymptom(brand, appliance, code);
  const profile = error ?? symptom;
  if (!profile) notFound();
  const isError = "code" in profile;
  const schema = isError
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `${profile.brand} ${profile.appliance} ${"code" in profile ? profile.code : ""}`,
        description: profile.meaning,
        step: profile.questions.map((q, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: q.text,
          text: q.why,
        })),
      }
    : null;

  return (
    <main>
      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
      <nav className="text-sm text-[#6a6a64]">
        <Link href={`/fixcode/${brand}`}>{profile.brand}</Link>
        {" / "}
        <Link href={`/fixcode/${brand}/${appliance}`}>{profile.appliance}</Link>
      </nav>
      <p className="mt-6 text-sm">
        {isError ? `Error ${error!.code}` : symptom!.symptom} · {profile.confidence} confidence
      </p>
      <h1 className="mt-2 text-4xl leading-tight">
        {isError ? error!.code : symptom!.symptom}
      </h1>
      <p className="mt-4 max-w-xl text-xl leading-8">{profile.meaning}</p>
      <Link
        href={`/fixcode/diagnose?brand=${brand}&appliance=${appliance}&code=${isError ? error!.code : symptom!.symptom_slug}`}
        className="fixcode-btn mt-8 inline-block"
      >
        Start diagnosis
      </Link>
      <section className="mt-12">
        <h2 className="text-sm tracking-[0.14em] uppercase">Most likely causes</h2>
        <ol className="mt-4 grid gap-3">
          {profile.causes.map((cause, index) => (
            <li key={cause.id} className="border border-[#e2ddd4] bg-[#fffcf7] p-4">
              <p>
                {index + 1}. {cause.name} · {Math.round(cause.prior * 100)}% prior
              </p>
              <p className="mt-2 text-sm leading-6 text-[#555]">{cause.summary}</p>
              <p className="mt-2 text-sm">
                {cause.safety.replaceAll("_", " ")} · {cause.time_minutes} min · €{cause.cost_eur_min}–{cause.cost_eur_max || 0}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-10">
        <h2 className="text-sm tracking-[0.14em] uppercase">Diagnostic checks</h2>
        <ol className="mt-3 list-decimal pl-5 text-[17px] leading-8">
          {profile.questions.map((q) => (
            <li key={q.id}>
              {q.text}
              <span className="block text-sm text-[#6a6a64]">{q.why}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-10 text-sm leading-6">
        <h2 className="text-sm tracking-[0.14em] uppercase">Sources</h2>
        <ul className="mt-3">
          {profile.provenance.map((row) => (
            <li key={row.source_id}>
              {row.source_type} · {row.verification_method} · {row.retrieved_at.slice(0, 10)}
              {row.source_url ? (
                <>
                  {" · "}
                  <a className="underline" href={row.source_url}>
                    origin
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      {"related_symptoms" in profile && profile.related_symptoms.length ? (
        <section className="mt-8">
          <h2 className="text-sm tracking-[0.14em] uppercase">Related</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.related_symptoms.map((slug) => (
              <li key={slug}>
                <Link className="border px-3 py-1 text-sm" href={`/fixcode/${brand}/${appliance}/${slug}`}>
                  {slug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="mt-12">
        <Feedback site="fixcode" />
      </div>
    </main>
  );
}
