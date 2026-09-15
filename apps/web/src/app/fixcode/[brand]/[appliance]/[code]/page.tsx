import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_ERRORS, ALL_SYMPTOMS, buildDiagnosticTree, getError, getSymptom } from "@penta/fixcode";
import { allFixcodePages } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";
import { ViewportScene } from "@/components/creative";
import { ErrorHero } from "../../../components/error-hero";

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
        "@type": "TechArticle",
        headline: `${profile.brand} ${profile.appliance} ${error!.code}`,
        description: profile.meaning,
        about: `${profile.brand} ${profile.appliance} error ${error!.code}`,
      }
    : null;
  const tree = buildDiagnosticTree(profile);
  const diyStop = tree.boundaries.length > 0;

  return (
    <main>
      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
      <ErrorHero profile={profile} brand={brand} appliance={appliance} />
      <ViewportScene className="fc-scene">
        <p className="fc-kicker">Scene 01 · meaning</p>
        <p className="mt-5 max-w-2xl text-3xl leading-tight">{profile.meaning}</p>
        <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--fc-mute)]">
          Run the safe checks first. This is a structured diagnostic tree — not a language-model guess.
        </p>
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <p className="fc-kicker">Scene 02 · possible causes</p>
        <ol className="mt-8">
          {profile.causes.map((cause, index) => (
            <li key={cause.id} className="fc-hypo">
              <span className="fixcode-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{cause.name}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--fc-mute)]">{cause.summary}</p>
              </div>
              <p className="text-right text-xs text-[var(--fc-mute)]">
                {cause.safety.replaceAll("_", " ")}
                <br />
                {cause.time_minutes} min · €{cause.cost_eur_min}–{cause.cost_eur_max || 0}
              </p>
            </li>
          ))}
        </ol>
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <p className="fc-kicker">Scene 03 · safe check</p>
        <ol className="mt-6 max-w-2xl list-decimal pl-5 text-lg leading-9">
          {profile.questions.map((q) => (
            <li key={q.id}>
              {q.text}
              <span className="block text-sm text-[var(--fc-mute)]">{q.why}</span>
            </li>
          ))}
        </ol>
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <p className="fc-kicker">Scene 04 · diagnostic narrowing</p>
        <Link
          href={`/fixcode/diagnose?brand=${brand}&appliance=${appliance}&code=${isError ? error!.code : symptom!.symptom_slug}`}
          className="fc-run mt-8 inline-block"
        >
          Start diagnosis
        </Link>
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <p className="fc-kicker">Scene 05 · OEM source</p>
        <ul className="mt-6 max-w-xl text-sm leading-7">
          {profile.provenance.map((row) => (
            <li key={row.source_id} className="border-t border-[var(--fc-line)] py-3">
              {row.source_type} · {row.verification_method} · {row.retrieved_at.slice(0, 10)}
              {row.locator?.section ? ` · ${row.locator.section}` : ""}
              {row.verified_at ? " · verified locator" : " · general / unverified"}
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
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <p className="fc-kicker">Scene 06 · when to stop DIY</p>
        {diyStop ? (
          <p className="mt-5 max-w-xl text-2xl text-[var(--fc-signal)]">
            Stop self-service if the tree hits a professional or stop-use boundary.
          </p>
        ) : (
          <p className="mt-5 max-w-xl text-2xl">No stop-use boundary on this tree. Risk still sits on each cause.</p>
        )}
        {"related_symptoms" in profile && profile.related_symptoms.length ? (
          <ul className="mt-8 flex flex-wrap gap-3">
            {profile.related_symptoms.map((slug) => (
              <li key={slug}>
                <Link className="border-b border-[var(--fc-ink)] text-sm" href={`/fixcode/${brand}/${appliance}/${slug}`}>
                  {slug}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-12">
          <Feedback site="fixcode" />
        </div>
      </ViewportScene>
    </main>
  );
}
