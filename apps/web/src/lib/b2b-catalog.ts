import { COMMERCE_SURFACE, EMPTY_NETWORK_COPY, SITE_LABEL, type SiteId } from "@penta/monetization";
import { ENGINE_ROUTES } from "@penta/platform-api";

export const B2B_SURFACES = [
  "developers",
  "api",
  "widgets",
  "data",
  "business",
  "docs",
  "contact-sales",
] as const;

export type B2BSurface = (typeof B2B_SURFACES)[number];

export type B2BPage = {
  site: SiteId;
  surface: B2BSurface;
  title: string;
  kicker: string;
  lede: string;
  sections: Array<{ title: string; body: string; code?: string }>;
};

const ENGINE: Record<SiteId, string> = {
  fixcode: "diagnostic tree + safety ceiling",
  autospec: "vehicle identity + service interval + fitment",
  wearthere: "climate-typical capsule",
  chargematch: "rated compatibility + limiting component",
  tripcost: "modelled corridor compare",
};

const OPERATOR: Record<SiteId, string> = {
  fixcode: "workshops and appliance brands",
  autospec: "independent garages and fleet desks",
  wearthere: "publishers and travel editors",
  chargematch: "labs and accessory makers",
  tripcost: "mobility operators",
};

export function b2bPage(site: SiteId, surface: B2BSurface): B2BPage {
  const name = SITE_LABEL[site];
  const engine = ENGINE[site];
  const route = ENGINE_ROUTES[site];
  const commerce = COMMERCE_SURFACE[site];
  const common = {
    site,
    surface,
  };

  if (surface === "developers") {
    return {
      ...common,
      title: `${name} for developers`,
      kicker: "Local engine, versioned contract",
      lede: `${name} exposes ${engine}. The v1 contract is the same engine the product UI uses. No sandbox tenant and no public price list exist.`,
      sections: [
        {
          title: "What you can call",
          body: `${route.method} ${route.path} — ${route.purpose}`,
          code: `curl -s http://127.0.0.1:43133${route.path} \\\n  -H "Authorization: Bearer penta_local_${site}_…" \\\n  -H "Content-Type: application/json" \\\n  -d '{}'`,
        },
        {
          title: "What you cannot buy here",
          body: "No hosted quota, no invoice, no partner marketplace. Issue a local key from /api/v1/keys. The secret is shown once and stored as a hash.",
        },
      ],
    };
  }

  if (surface === "api") {
    return {
      ...common,
      title: `${name} API`,
      kicker: "v1 · local metering",
      lede: `Authenticated calls increment a local daily counter. Soft cap 200. Exceeding it is recorded as meter_exceeded. It does not mint a bill.`,
      sections: [
        { title: "Contract", body: "GET /api/v1/contract returns engines, platform routes, billing: null, rateCard: null." },
        { title: "Auth", body: "Authorization: Bearer penta_local_<site>_<token>. Unknown format is 401. Missing scope is 403." },
        { title: "First-party routes", body: `The unversioned /api/${site}/* handlers remain for the product UI and do not require a key.` },
      ],
    };
  }

  if (surface === "widgets") {
    return {
      ...common,
      title: `${name} widget`,
      kicker: "Same-origin embed",
      lede: `An iframe loads /embed/${site}. It runs the real engine on entities that already exist. Empty catalogs stay empty.`,
      sections: [
        {
          title: "Snippet",
          body: "Host the script from this origin. There is no third-party widget CDN.",
          code: `<script src="/widgets/${site}" data-site="${site}"></script>`,
        },
        { title: "Honesty", body: commerce.body },
      ],
    };
  }

  if (surface === "data") {
    return {
      ...common,
      title: `${name} data`,
      kicker: "Provenance stays attached",
      lede: "Licensing talk is a local sales inquiry. No dataset dump, no invented coverage percentage, and USER_REPORTED rows cannot be sold as official.",
      sections: [
        { title: "What is on file", body: `The assembled catalog for ${name} plus manufacturer/official locators already referenced by the engine.` },
        { title: "What is not for sale as TESTED", body: "Feedback and local observations stay USER_REPORTED or USER_OBSERVED." },
      ],
    };
  }

  if (surface === "business") {
    return {
      ...common,
      title: `${name} for ${OPERATOR[site]}`,
      kicker: "No contracted network",
      lede: EMPTY_NETWORK_COPY[site],
      sections: [
        { title: "Decision surface", body: commerce.body },
        { title: "Commercial status", body: "shopEnabled=false, pricesPublished=false, inventory=[]. A lead is stored locally and left unassigned." },
      ],
    };
  }

  if (surface === "docs") {
    return {
      ...common,
      title: `${name} docs`,
      kicker: "How the engine answers",
      lede: `${name} answers only from seeded, sourced facts. Missing entities return unknown_entity. This documentation does not invent a SLA.`,
      sections: [
        { title: "Product engine", body: engine },
        { title: "Truth", body: "opportunityScore is an internal queue. It cannot flip a page to INDEXABLE." },
        { title: "Local store", body: "Events, leads, keys, and meter live in data/platform on this machine." },
      ],
    };
  }

  return {
    ...common,
    title: `Contact ${name}`,
    kicker: "Sales inquiry · unassigned",
    lede: `Write a local ${commerce.leadKind.replaceAll("_", " ")}. ${EMPTY_NETWORK_COPY[site]}`,
    sections: [
      { title: "What happens", body: "POST /api/v1/leads stores the row with assignedPartnerId: null. Nobody is emailed." },
      { title: "Do not expect", body: "A quote, a partner callback, or a published price." },
    ],
  };
}

export function b2bNav(site: SiteId) {
  return B2B_SURFACES.map((surface) => ({
    href: `/${site}/${surface}`,
    label: surface.replace("-", " "),
  }));
}
