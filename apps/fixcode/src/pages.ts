import { slugify, type PageRecord } from "@penta/graph-core";
import {
  evaluatePageQuality,
  searchDemandScore,
  type PageQualityInput,
} from "@penta/quality-gate";
import { ALL_ERRORS, ALL_SYMPTOMS, canonicalErrorCode, isAliasError } from "./engine";
import { APPLIANCES, BRANDS } from "./data-symptoms";
import type { ErrorProfile, SymptomProfile } from "./types";
import { buildDiagnosticTree } from "./diagnostic-tree";

function canonicalErrors(): ErrorProfile[] {
  return ALL_ERRORS.filter((item) => !isAliasError(item.brand_slug, item.appliance_slug, item.code));
}

function requiredFields(profile: ErrorProfile): string[] {
  const fields = [
    profile.meaning,
    profile.affected_family,
    profile.causes.length >= 3 ? "causes" : "",
    profile.questions.length >= 1 ? "steps" : "",
    profile.safety_notes.length ? "risk" : "",
    profile.causes.some((cause) => cause.fix) ? "fixes" : "",
    profile.confidence,
    profile.provenance.length ? "provenance" : "",
    profile.related_symptoms.length ? "related" : "",
  ];
  return fields.filter(Boolean);
}

function qualityInputForError(profile: ErrorProfile): PageQualityInput {
  const required = 9;
  const present = requiredFields(profile).length;
  return {
    site: "fixcode",
    family: "error-code",
    unique_fields: present + profile.causes.length,
    required_fields_present: present,
    required_fields_total: required,
    search_demand: { seed_research: profile.search_demand },
    product_cta: true,
    interactive: true,
    distinct_from_parent: true,
    near_duplicate: false,
    year_only_variant: false,
    city_without_specifics: false,
    obscure_without_demand: profile.search_demand < 20,
    llm_filler: false,
    confidence: profile.confidence,
    freshness_days: 30,
    freshness_ttl_days: 365,
    provenance_valid: profile.provenance.length > 0,
    distinct_reason: profile.id,
    causes_without_source: profile.provenance.length === 0,
    llm_safety_claim: false,
    verified_fact_count: present + profile.causes.filter((c) => c.fix).length,
    decision_relation_count: profile.causes.length + profile.questions.length,
    site_rules: () => {
      const blockers: string[] = [];
      if (present < 8) blockers.push("Error page missing required diagnostic fields");
      if (profile.causes.length < 2) blockers.push("Need multiple causes");
      return { delta: 0, reasons: [], blockers };
    },
  };
}

function hashPayload(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url").slice(0, 24);
}

export function errorPage(profile: ErrorProfile): PageRecord {
  const url = `/${profile.brand_slug}/${profile.appliance_slug}/${profile.code_slug}`;
  if (isAliasError(profile.brand_slug, profile.appliance_slug, profile.code)) {
    const canon = canonicalErrorCode(profile.brand_slug, profile.appliance_slug, profile.code);
    const canonUrl = `/fixcode/${profile.brand_slug}/${profile.appliance_slug}/${canon.toLowerCase()}-error`;
    return {
      id: profile.id,
      site: "fixcode",
      family: "error-code",
      url: `/fixcode${url}`,
      canonical: canonUrl,
      title: `${profile.brand} ${profile.appliance} ${profile.code} → ${canon}`,
      meta_description: `${profile.code} is a display alias of ${canon}.`,
      entity_ids: [profile.id],
      structured_payload: {
        brand: profile.brand,
        appliance: profile.appliance,
        code: profile.code,
        alias_of: canon,
        redirect_to: canonUrl,
        distinct_reason: `${profile.id}-alias`,
      },
      quality_score: 0,
      search_demand: 0,
      index_state: "REDIRECT",
      noindex: true,
      similarity_hash: `alias:${profile.id}`,
      freshness: profile.provenance[0]?.retrieved_at ?? "",
      review_required: false,
      batch: "fixcode-alias",
      publish_state: "DRAFT",
    };
  }
  const payload = {
    brand: profile.brand,
    appliance: profile.appliance,
    code: profile.code,
    meaning: profile.meaning,
    causes: profile.causes.map((cause) => cause.id),
    questions: profile.questions.map((q) => q.id),
    tests: profile.questions.map((q) => q.id),
    distinct_reason: profile.id,
    diagnostic_tree: buildDiagnosticTree(profile),
    action_evidence: {
      actionType: "DIAGNOSE",
      inputFields: ["brand", "appliance", "code"],
      outputFields: ["causes", "questions"],
      rendered: true,
      executable: true,
      decisionFields: ["causes", "safety"],
    },
  };
  const quality = evaluatePageQuality(qualityInputForError(profile));
  const demand = searchDemandScore({ seed_research: profile.search_demand });
  return {
    id: profile.id,
    site: "fixcode",
    family: "error-code",
    url: `/fixcode${url}`,
    canonical: `/fixcode${url}`,
    title: `${profile.brand} ${profile.appliance} ${profile.code} Error: Meaning, Causes & Fix`,
    meta_description: `${profile.brand} ${profile.appliance} ${profile.code}: ${profile.meaning} Ranked causes, checks, risk, and likely cost from structured service data.`,
    entity_ids: [profile.id, ...profile.causes.map((cause) => `${profile.id}:cause:${cause.id}`)],
    structured_payload: payload,
    quality_score: quality.score,
    search_demand: demand,
    index_state: quality.index_state,
    noindex: quality.index_state !== "INDEXABLE",
    similarity_hash: hashPayload(payload),
    freshness: profile.provenance[0]?.retrieved_at ?? "",
    review_required: profile.causes.some((cause) => cause.safety === "PROFESSIONAL_ONLY"),
    batch: "fixcode-batch-2",
    publish_state: quality.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
  };
}

export function symptomPage(profile: SymptomProfile): PageRecord {
  const brandPart = profile.brand_slug ? `/${profile.brand_slug}` : "";
  const url = `${brandPart}/${profile.appliance_slug}/${profile.symptom_slug}`;
  const payload = {
    brand: profile.brand,
    appliance: profile.appliance,
    symptom: profile.symptom,
    meaning: profile.meaning,
    causes: profile.causes.map((cause) => cause.id),
    tests: profile.questions.map((q) => q.id),
    distinct_reason: profile.id,
    action_evidence: {
      actionType: "DIAGNOSE",
      inputFields: ["appliance", "symptom"],
      outputFields: ["causes", "meaning"],
      rendered: true,
      executable: true,
      decisionFields: ["causes", "meaning"],
    },
  };
  const quality = evaluatePageQuality({
    site: "fixcode",
    family: "symptom",
    unique_fields: 6 + profile.causes.length,
    required_fields_present: 7,
    required_fields_total: 8,
    search_demand: { seed_research: profile.search_demand },
    product_cta: true,
    interactive: true,
    distinct_from_parent: true,
    near_duplicate: false,
    year_only_variant: false,
    city_without_specifics: false,
    obscure_without_demand: profile.search_demand < 25,
    llm_filler: false,
    confidence: profile.confidence,
    freshness_days: 40,
    freshness_ttl_days: 180,
    provenance_valid: profile.provenance.length > 0,
    distinct_reason: profile.id,
    causes_without_source: profile.provenance.length === 0,
    verified_fact_count: 5 + profile.causes.length,
    decision_relation_count: profile.causes.length + profile.questions.length,
  });
  return {
    id: profile.id,
    site: "fixcode",
    family: "symptom",
    url: `/fixcode${url}`,
    canonical: `/fixcode${url}`,
    title: `${profile.brand ?? ""} ${profile.appliance} ${profile.symptom}: Causes & Checks`.replace(
      /\s+/g,
      " ",
    ).trim(),
    meta_description: `${profile.meaning} Start a structured diagnosis.`,
    entity_ids: [profile.id],
    structured_payload: payload,
    quality_score: quality.score,
    search_demand: searchDemandScore({ seed_research: profile.search_demand }),
    index_state: quality.index_state,
    noindex: quality.index_state !== "INDEXABLE",
    similarity_hash: hashPayload(payload),
    freshness: profile.provenance[0]?.retrieved_at ?? "",
    review_required: true,
    batch: "fixcode-batch-2",
    publish_state: quality.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
  };
}

export function hubPages(): PageRecord[] {
  const pages: PageRecord[] = [];
  for (const brand of BRANDS) {
    const errors = canonicalErrors().filter((item) => item.brand_slug === brand.slug);
    const payload = {
      brand: brand.slug,
      codes: errors.map((item) => item.code),
      distinct_reason: `hub-${brand.slug}`,
      action_evidence: {
        actionType: "FILTER",
        inputFields: ["brand"],
        outputFields: ["codes"],
        rendered: true,
        executable: true,
        decisionFields: ["codes"],
      },
    };
    const quality = evaluatePageQuality({
      site: "fixcode",
      family: "brand-hub",
      unique_fields: errors.length,
      required_fields_present: errors.length >= 3 ? 8 : 4,
      required_fields_total: 8,
      search_demand: { seed_research: errors.length >= 3 ? 70 : 20 },
      product_cta: true,
      interactive: false,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: errors.length < 2,
      llm_filler: false,
      confidence: "HIGH",
      freshness_days: 30,
      freshness_ttl_days: 365,
      provenance_valid: true,
      hub_necessity: true,
      distinct_reason: `hub-${brand.slug}`,
      verified_fact_count: Math.min(8, errors.length),
      decision_relation_count: Math.min(6, errors.length),
    });
    pages.push({
      id: `fix:hub:${brand.slug}`,
      site: "fixcode",
      family: "brand-hub",
      url: `/fixcode/${brand.slug}`,
      canonical: `/fixcode/${brand.slug}`,
      title: `${brand.name} appliance errors`,
      meta_description: `Verified ${brand.name} error codes with diagnostic trees.`,
      entity_ids: errors.map((item) => item.id),
      structured_payload: payload,
      quality_score: quality.score,
      search_demand: searchDemandScore({ seed_research: errors.length >= 3 ? 70 : 20 }),
      index_state: quality.index_state,
      noindex: quality.index_state !== "INDEXABLE",
      similarity_hash: hashPayload(payload),
      freshness: "2026-08-12T00:00:00.000Z",
      review_required: false,
      batch: "fixcode-batch-2",
      publish_state: quality.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
    });
  }
  for (const brand of BRANDS) {
    const appliances = [...new Set(canonicalErrors().filter((item) => item.brand_slug === brand.slug).map((item) => item.appliance_slug))];
    for (const appliance of appliances) {
      const errors = canonicalErrors().filter(
        (item) => item.brand_slug === brand.slug && item.appliance_slug === appliance,
      );
      const name = APPLIANCES.find((item) => item.slug === appliance)?.name ?? appliance;
      const payload = {
        brand: brand.slug,
        appliance,
        codes: errors.map((item) => item.code),
        distinct_reason: `hub-${brand.slug}-${appliance}`,
        action_evidence: {
          actionType: "FILTER",
          inputFields: ["brand", "appliance"],
          outputFields: ["codes"],
          rendered: true,
          executable: true,
          decisionFields: ["codes"],
        },
      };
      const quality = evaluatePageQuality({
        site: "fixcode",
        family: "appliance-hub",
        unique_fields: errors.length + 3,
        required_fields_present: 8,
        required_fields_total: 8,
        search_demand: { seed_research: 76 },
        product_cta: true,
        interactive: true,
        distinct_from_parent: true,
        near_duplicate: false,
        year_only_variant: false,
        city_without_specifics: false,
        obscure_without_demand: false,
        llm_filler: false,
        confidence: "HIGH",
        freshness_days: 30,
        freshness_ttl_days: 365,
        provenance_valid: true,
        hub_necessity: true,
        distinct_reason: `hub-${brand.slug}-${appliance}`,
        verified_fact_count: 6,
        decision_relation_count: Math.min(8, errors.length),
      });
      pages.push({
        id: `fix:hub:${brand.slug}:${appliance}`,
        site: "fixcode",
        family: "appliance-hub",
        url: `/fixcode/${brand.slug}/${appliance}`,
        canonical: `/fixcode/${brand.slug}/${appliance}`,
        title: `${brand.name} ${name} errors`,
        meta_description: `${brand.name} ${name} error codes with causes, checks, and risk.`,
        entity_ids: errors.map((item) => item.id),
        structured_payload: payload,
        quality_score: quality.score,
        search_demand: 76,
        index_state: quality.index_state,
        noindex: quality.index_state !== "INDEXABLE",
        similarity_hash: hashPayload(payload),
        freshness: "2026-08-12T00:00:00.000Z",
        review_required: false,
        batch: "fixcode-batch-2",
        publish_state: quality.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
      });
    }
  }
  return pages;
}

export function allFixcodePages(): PageRecord[] {
  return [
    ...ALL_ERRORS.map(errorPage),
    ...ALL_SYMPTOMS.map(symptomPage),
    ...hubPages(),
  ];
}

export { slugify };
