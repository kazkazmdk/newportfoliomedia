import type { SiteId } from "@penta/monetization";
import { ENGINE_ROUTES } from "@penta/platform-api";
import type { B2BSurface } from "@/lib/b2b-catalog";

export function productStory(site: SiteId): { hero: string; proof: string; sample: Record<string, unknown>; error: Record<string, unknown> } {
  if (site === "fixcode") {
    return {
      hero: "Diagnostic trees, not repair ads.",
      proof: "Safety ceiling and sourced causes. Missing brands stay missing.",
      sample: { brand: "samsung", appliance: "washer", error: "4C" },
      error: { error: { code: "unknown_entity", message: "We don't have verified data yet." } },
    };
  }
  if (site === "autospec") {
    return {
      hero: "Vehicle identity before any part number.",
      proof: "Generation + engine + market. Fitment is never guessed by an LLM.",
      sample: { make: "bmw", model: "3-series", generation: "g20", variant: "320d-b47" },
      error: { error: { code: "unknown_entity", message: "Unknown vehicle identity." } },
    };
  }
  if (site === "chargematch") {
    return {
      hero: "Rated path and the component that limits it.",
      proof: "Device / cable / port / allocation. Not a measured wall draw unless a lab row exists.",
      sample: { device: "iphone-16", charger: "apple-20w" },
      error: { error: { code: "unknown_entity", message: "Unknown device or charger." } },
    };
  }
  if (site === "tripcost") {
    return {
      hero: "Corridor cost, not a ticket checkout.",
      proof: "Modelled cash vs true cost. Geography is a corridor, not a turn-by-turn route.",
      sample: { origin: "paris", destination: "lyon", travellers: 1 },
      error: { error: { code: "unknown_entity", message: "Unknown corridor." } },
    };
  }
  return {
    hero: "Climate-typical capsules, not a live forecast shop.",
    proof: "Typical month climate. Missing pieces are gaps, not SKUs.",
    sample: { destination: "lisbon", month: 10 },
    error: { error: { code: "unknown_entity", message: "Unknown destination." } },
  };
}

export function productOperatorStory(site: SiteId) {
  if (site === "fixcode") {
    return {
      title: "What a workshop actually gets",
      body: "Error-code coverage that is already sourced, a safety-aware triage tree, and a repair workflow that stops at unknown brands. Brand or service integration is a contract, not a page template.",
    };
  }
  if (site === "autospec") {
    return {
      title: "What a catalog desk actually gets",
      body: "Vehicle identity first, then intervals and fitment. Normalization is for generations and engines that exist. Catalog enrichment never invents a SKU.",
    };
  }
  if (site === "chargematch") {
    return {
      title: "What a hardware desk actually gets",
      body: "Protocol negotiation and the power bottleneck. Retailer compatibility checks only run on seeded device/charger pairs. Hardware catalog QA is the engine, not a price grid.",
    };
  }
  if (site === "tripcost") {
    return {
      title: "What a fleet desk actually gets",
      body: "Route-cost modelling with explicit assumptions. Scenario analysis stays modelled. There is no live booking affiliate until a program exists.",
    };
  }
  return {
    title: "What an editor actually gets",
    body: "Climate-linked packing intelligence and destination context. Travel enrichment uses typical-month climate. Missing items stay gaps.",
  };
}

export function playgroundCurl(site: SiteId, surface: B2BSurface) {
  const route = ENGINE_ROUTES[site];
  const story = productStory(site);
  if (surface !== "developers" && surface !== "api" && surface !== "docs") return undefined;
  return `curl -s ${route.path} \\\n  -H "Authorization: Bearer penta_local_${site}_…" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(story.sample)}'`;
}
