import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_ERRORS, ALL_SYMPTOMS, buildDiagnosticTree, getError, getSymptom } from "@penta/fixcode";
import { allFixcodePages } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";
import { NextAction } from "@/components/next-action";
import { ViewportScene } from "@/components/creative";
import { CheckDiagram, checkKindFromText } from "../../../components/machine-diagrams";
import { ErrorHero } from "../../../components/error-hero";
import { SectionLabel, StateBadge, type FixcodeState } from "../../../components/system-ui";

function safetyState(safety: string): FixcodeState {
  if (safety === "STOP_USE" || safety === "PROFESSIONAL_ONLY") return "stop";
  if (safety === "CAUTION") return "caution";
  return "ready";
}

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
      <ErrorHero
        profile={profile}
        brand={brand}
        appliance={appliance}
        diagnoseHref={`/fixcode/diagnose?brand=${brand}&appliance=${appliance}&code=${isError ? error!.code : symptom!.symptom_slug}`}
      />
      <ViewportScene className="fc-scene">
        <SectionLabel number="02">Why this check comes first</SectionLabel>
        {profile.questions[0] ? (
          <div className="fc-rationale">
            <StateBadge state="ready">Reversible first</StateBadge>
            <p>{profile.questions[0].why}</p>
          </div>
        ) : (
          <div className="fc-rationale">
            <StateBadge state="caution">No safe check on file</StateBadge>
            <p>Do not invent a step.</p>
          </div>
        )}
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <SectionLabel number="03">Continue narrowing</SectionLabel>
        <ol className="mt-6 grid max-w-3xl gap-5">
          {profile.questions.slice(1).map((q, index) => (
            <li key={q.id} className="fc-check">
              <CheckDiagram kind={checkKindFromText(`${q.text} ${q.why}`)} />
              <div>
                <span className="fixcode-mono text-[10px] text-[var(--fc-mute)]">{String(index + 2).padStart(2, "0")}</span>
                <p className="mt-1">{q.text}</p>
                <span className="block text-sm text-[var(--fc-mute)]">{q.why}</span>
              </div>
            </li>
          ))}
        </ol>
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <SectionLabel number="04">DIY boundary</SectionLabel>
        {diyStop ? (
          <div className="fc-boundary fc-boundary--stop mt-6">
            <StateBadge state="stop">Stop self-service</StateBadge>
            <p>{tree.boundaries.find((b) => b.blocksSelfService)?.text ?? "Stop self-service if the tree hits a professional or stop-use boundary."}</p>
          </div>
        ) : (
          <div className="fc-boundary mt-6">
            <StateBadge state="caution">Check each cause</StateBadge>
            <p>No stop-use boundary is recorded on this tree. Risk still sits on each cause.</p>
          </div>
        )}
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <SectionLabel number="05">Cause register</SectionLabel>
        <ol className="mt-8">
          {profile.causes.map((cause, index) => (
            <li key={cause.id} className="fc-hypo">
              <span className="fixcode-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{cause.name}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--fc-mute)]">{cause.summary}</p>
              </div>
              <div className="fc-cause-meta">
                <StateBadge state={safetyState(cause.safety)}>{cause.safety.replaceAll("_", " ")}</StateBadge>
                <span>{cause.time_minutes} min · €{cause.cost_eur_min}–{cause.cost_eur_max || 0}</span>
              </div>
            </li>
          ))}
        </ol>
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <SectionLabel number="06">Manufacturer source</SectionLabel>
        <ul className="mt-6 max-w-xl text-sm leading-7">
          {profile.provenance.map((row) => (
            <li key={row.source_id} className="fc-evidence border-t border-[var(--fc-line)] py-4">
              <p className="text-lg">{row.source_name ?? "Documented source"}</p>
              <p className="mt-2 fixcode-mono text-[11px] uppercase tracking-[0.16em] text-[var(--fc-mute)]">
                {row.source_type === "MANUFACTURER" ? "Official support" : row.source_type.replaceAll("_", " ")}
                {" · "}
                {row.verified_at ? "locator verified" : "general / unverified"}
                {" · "}
                retrieved {row.retrieved_at.slice(0, 10)}
              </p>
              {row.source_url ? (
                <a className="mt-3 inline-block underline" href={row.source_url}>
                  Open original source
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <SectionLabel number="07">Related paths</SectionLabel>
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
          <NextAction
            site="fixcode"
            entityId={profile.id}
            official={
              profile.provenance.find((row) => row.source_url)?.source_url
                ? {
                    href: profile.provenance.find((row) => row.source_url)!.source_url!,
                    label: profile.provenance.find((row) => row.source_url)?.source_name ?? "Open manufacturer source",
                    sourceName: profile.provenance.find((row) => row.source_url)?.source_type ?? "SOURCE",
                  }
                : undefined
            }
          />
          <Feedback site="fixcode" entityId={profile.id} />
        </div>
      </ViewportScene>
    </main>
  );
}
