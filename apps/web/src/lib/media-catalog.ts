import { DESTINATIONS, climateModelOf } from "@penta/wearthere";
import type { ClimateSeasonModel } from "@penta/demand";

export type DestinationMedia = {
  hero: string;
  detail: string;
  heroAlt: string;
  detailAlt: string;
  credit: string;
};

const FALLBACK: DestinationMedia = {
  hero: "/media/wearthere/tokyo-rain-commons.jpg",
  detail: "/media/wearthere/tokyo-alt.webp",
  heroAlt: "Wet night street with a pedestrian under an umbrella",
  detailAlt: "Tokyo street atmosphere",
  credit: "Wikimedia Commons · CC0",
};

export const DESTINATION_MEDIA: Record<string, DestinationMedia> = {
  tokyo: {
    hero: "/media/wearthere/tokyo-rain-commons.jpg",
    detail: "/media/wearthere/tokyo-alt.webp",
    heroAlt: "Person under a black umbrella on a wet Tokyo night sidewalk",
    detailAlt: "Tokyo street lighting and clothing scale",
    credit: "Light rain in Tokyo · Wikimedia Commons · CC0",
  },
  paris: {
    hero: "/media/wearthere/paris-rain-commons.jpg",
    detail: "/media/wearthere/paris-street-commons.jpg",
    heroAlt: "Wet autumn road and fallen leaves under a steel sky",
    detailAlt: "Paris autumn rain cityscape",
    credit: "Paris raining autumn · Wikimedia Commons · CC BY 2.0",
  },
  london: {
    hero: "/media/wearthere/london-rain-commons.jpg",
    detail: "/media/wearthere/london-hero.webp",
    heroAlt: "Kingly Street in the rain with coats and umbrellas",
    detailAlt: "London street atmosphere",
    credit: "Kingly Street in the rain · Wikimedia Commons · CC BY 2.0",
  },
  lisbon: {
    hero: "/media/wearthere/lisbon-gold-commons.jpg",
    detail: "/media/wearthere/lisbon-alt.webp",
    heroAlt: "Lisbon side street in warm late light",
    detailAlt: "Lisbon warm architectural street",
    credit: "Golden hour in Lisbon · Wikimedia Commons · CC0",
  },
  reykjavik: {
    hero: "/media/wearthere/reykjavik-hero.webp",
    detail: "/media/wearthere/reykjavik-hero.webp",
    heroAlt: "Cold Icelandic light and outerwear weather",
    detailAlt: "Reykjavik / Iceland winter atmosphere",
    credit: "Unsplash License",
  },
  singapore: {
    hero: "/media/wearthere/singapore-hero.webp",
    detail: "/media/wearthere/singapore-alt.webp",
    heroAlt: "Humid Singapore city street",
    detailAlt: "Singapore night humidity",
    credit: "Unsplash License",
  },
  sydney: {
    hero: "/media/wearthere/sydney-street-commons.jpg",
    detail: "/media/wearthere/sydney-alt.webp",
    heroAlt: "George Street, Sydney at dusk",
    detailAlt: "Sydney evening light",
    credit: "George Street Sydney dusk · Wikimedia Commons · CC0",
  },
  "new-york": {
    hero: "/media/wearthere/nyc-rain-commons.jpg",
    detail: "/media/wearthere/new-york-hero.webp",
    heroAlt: "Cyclist in a yellow rain shell on a wet New York night",
    detailAlt: "New York night street",
    credit: "New York rain night · Wikimedia Commons · CC BY-SA 2.0",
  },
  dubai: {
    hero: "/media/wearthere/dubai-hero.webp",
    detail: "/media/wearthere/dubai-alt.webp",
    heroAlt: "Dubai evening urban heat",
    detailAlt: "Dubai night city atmosphere",
    credit: "Unsplash License",
  },
  seoul: {
    hero: "/media/wearthere/seoul-hero.webp",
    detail: "/media/wearthere/seoul-street-commons.jpg",
    heroAlt: "Seoul night street",
    detailAlt: "Seoul street at human scale",
    credit: "Unsplash License / Streets of Seoul · CC BY-SA 4.0",
  },
  rome: {
    hero: "/media/wearthere/rome-hero.webp",
    detail: "/media/wearthere/rome-hero.webp",
    heroAlt: "Rome street warmth",
    detailAlt: "Rome street warmth",
    credit: "Unsplash License",
  },
  amsterdam: {
    hero: "/media/wearthere/amsterdam-hero.webp",
    detail: "/media/wearthere/amsterdam-hero.webp",
    heroAlt: "Amsterdam canal street",
    detailAlt: "Amsterdam canal street",
    credit: "Unsplash License",
  },
  barcelona: {
    hero: "/media/wearthere/barcelona-hero.webp",
    detail: "/media/wearthere/barcelona-hero.webp",
    heroAlt: "Barcelona street light",
    detailAlt: "Barcelona street light",
    credit: "Unsplash License",
  },
  "hong-kong": {
    hero: "/media/wearthere/hong-kong-hero.webp",
    detail: "/media/wearthere/hong-kong-hero.webp",
    heroAlt: "Hong Kong humid night street",
    detailAlt: "Hong Kong humid night street",
    credit: "Unsplash License",
  },
};

export function destinationMedia(slug: string): DestinationMedia {
  return DESTINATION_MEDIA[slug] ?? FALLBACK;
}

export type SeasonId = "winter" | "spring" | "summer" | "autumn";
export type SeasonProfile = "northern-temperate" | "southern-temperate" | "tropical" | "desert";
export type SeasonKey = SeasonId | "wet" | "dry" | "hot" | "mild" | "humid";
export type Hemisphere = "north" | "south" | "tropical";

export function seasonProfileFromModel(model: ClimateSeasonModel): SeasonProfile {
  if (model === "SOUTHERN_TEMPERATE") return "southern-temperate";
  if (model === "HOT_DESERT") return "desert";
  if (model === "EQUATORIAL" || model === "TROPICAL_WET_DRY" || model === "MONSOON") return "tropical";
  return "northern-temperate";
}

export function seasonProfileOf(slug: string): SeasonProfile {
  const dest = DESTINATIONS.find((item) => item.slug === slug);
  if (!dest) return "northern-temperate";
  return seasonProfileFromModel(climateModelOf(dest));
}

export function hemisphereOf(slug: string): Hemisphere {
  const dest = DESTINATIONS.find((item) => item.slug === slug);
  const profile = seasonProfileOf(slug);
  if (profile === "tropical") return "tropical";
  if ((dest?.lat ?? 1) < 0) return "south";
  return "north";
}

export function seasonOfMonth(month: number, profile: SeasonProfile = "northern-temperate"): SeasonKey {
  if (profile === "southern-temperate") {
    if (month === 12 || month <= 2) return "summer";
    if (month <= 5) return "autumn";
    if (month <= 8) return "winter";
    return "spring";
  }
  if (profile === "tropical") {
    return [11, 12, 1, 2, 3].includes(month) ? "dry" : "wet";
  }
  if (profile === "desert") {
    return [6, 7, 8, 9].includes(month) ? "hot" : "mild";
  }
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "autumn";
}

const SEASONAL_MEDIA: Partial<Record<string, Partial<Record<SeasonId, DestinationMedia>>>> = {
  tokyo: {
    winter: DESTINATION_MEDIA.tokyo,
    spring: {
      hero: "/media/wearthere/tokyo-alt.webp",
      detail: "/media/wearthere/tokyo-street.webp",
      heroAlt: "Tokyo street in clearer spring light",
      detailAlt: "Tokyo street scale",
      credit: "Unsplash License",
    },
    summer: {
      hero: "/media/wearthere/tokyo-street.webp",
      detail: "/media/wearthere/tokyo-hero.webp",
      heroAlt: "Tokyo street humidity and night light",
      detailAlt: "Tokyo crossing atmosphere",
      credit: "Unsplash License",
    },
    autumn: {
      hero: "/media/wearthere/tokyo-hero.webp",
      detail: "/media/wearthere/tokyo-rain-commons.jpg",
      heroAlt: "Tokyo autumn night street",
      detailAlt: "Wet Tokyo sidewalk",
      credit: "Unsplash License / Wikimedia Commons CC0",
    },
  },
  paris: {
    winter: DESTINATION_MEDIA.paris,
    autumn: DESTINATION_MEDIA.paris,
    spring: {
      hero: "/media/wearthere/paris-street-commons.jpg",
      detail: "/media/wearthere/paris-street.webp",
      heroAlt: "Paris street after rain",
      detailAlt: "Paris street atmosphere",
      credit: "Wikimedia Commons · CC BY 2.0",
    },
    summer: {
      hero: "/media/wearthere/paris-street.webp",
      detail: "/media/wearthere/paris-alt.webp",
      heroAlt: "Paris summer street light",
      detailAlt: "Paris street warmth",
      credit: "Unsplash License",
    },
  },
  london: {
    winter: DESTINATION_MEDIA.london,
    autumn: DESTINATION_MEDIA.london,
    spring: {
      hero: "/media/wearthere/london-hero.webp",
      detail: "/media/wearthere/london-rain-commons.jpg",
      heroAlt: "London street in clearer light",
      detailAlt: "London rain street",
      credit: "Unsplash License / Wikimedia Commons CC BY 2.0",
    },
    summer: {
      hero: "/media/wearthere/london-hero.webp",
      detail: "/media/wearthere/london-hero.webp",
      heroAlt: "London summer street",
      detailAlt: "London street",
      credit: "Unsplash License",
    },
  },
  lisbon: {
    summer: DESTINATION_MEDIA.lisbon,
    autumn: DESTINATION_MEDIA.lisbon,
    spring: {
      hero: "/media/wearthere/lisbon-alt.webp",
      detail: "/media/wearthere/lisbon-gold-commons.jpg",
      heroAlt: "Lisbon street in cooler light",
      detailAlt: "Lisbon gold hour",
      credit: "Unsplash License / Wikimedia Commons CC0",
    },
    winter: {
      hero: "/media/wearthere/lisbon-alt.webp",
      detail: "/media/wearthere/lisbon-alt.webp",
      heroAlt: "Lisbon winter street",
      detailAlt: "Lisbon street",
      credit: "Unsplash License",
    },
  },
  "new-york": {
    winter: DESTINATION_MEDIA["new-york"],
    autumn: DESTINATION_MEDIA["new-york"],
    summer: {
      hero: "/media/wearthere/new-york-hero.webp",
      detail: "/media/wearthere/nyc-rain-commons.jpg",
      heroAlt: "New York in clearer evening light",
      detailAlt: "New York rain night",
      credit: "Unsplash License / Wikimedia Commons CC BY-SA 2.0",
    },
    spring: {
      hero: "/media/wearthere/new-york-hero.webp",
      detail: "/media/wearthere/new-york-hero.webp",
      heroAlt: "New York spring street",
      detailAlt: "New York street",
      credit: "Unsplash License",
    },
  },
};

export function destinationSeasonMedia(slug: string, month: number): DestinationMedia {
  const profile = seasonProfileOf(slug);
  const season = seasonOfMonth(month, profile);
  const temperate = season === "winter" || season === "spring" || season === "summer" || season === "autumn"
    ? season
    : undefined;
  return (temperate ? SEASONAL_MEDIA[slug]?.[temperate] : undefined) ?? destinationMedia(slug);
}

export function seasonalMediaCoverage(): Array<{
  destination: string;
  seasonProfile: SeasonProfile;
  hemisphere: Hemisphere;
  seasonalMediaCount: number;
  fallbackUsed: boolean;
}> {
  return DESTINATIONS.map((dest) => {
    const seasonProfile = seasonProfileOf(dest.slug);
    const seasonalMediaCount = Object.keys(SEASONAL_MEDIA[dest.slug] ?? {}).length;
    return {
      destination: dest.slug,
      seasonProfile,
      hemisphere: hemisphereOf(dest.slug),
      seasonalMediaCount,
      fallbackUsed: seasonalMediaCount === 0,
    };
  });
}

export type VehicleMedia = {
  src: string;
  alt: string;
  credit: string;
  note: string;
};

export const VEHICLE_MEDIA: Record<string, VehicleMedia> = {
  "bmw:g20": {
    src: "/media/autospec/bmw-g20.jpg",
    alt: "BMW 3 Series G20 sedan, same-generation body used for the 320d identity",
    credit: "Dinkun Chen · Wikimedia Commons · CC BY-SA 4.0",
    note: "G20 body. Not a 320d-specific trim photo.",
  },
  "toyota:e210": {
    src: "/media/autospec/toyota-corolla-e210.jpg",
    alt: "Toyota Corolla Hybrid E210 hatchback",
    credit: "Alexander-93 · Wikimedia Commons · CC BY-SA 4.0",
    note: "E210 generation hybrid body.",
  },
  "volkswagen:mk8": {
    src: "/media/autospec/vw-golf-mk8.jpg",
    alt: "Volkswagen Golf Mk8",
    credit: "Vauxford · Wikimedia Commons · CC BY-SA 4.0",
    note: "Mk8 generation body.",
  },
  "tesla:highland": {
    src: "/media/autospec/tesla-model-3-highland.jpg",
    alt: "Tesla Model 3 Highland generation",
    credit: "Mliu92 · Wikimedia Commons · CC BY-SA 4.0",
    note: "Highland body. Identity on file is RWD.",
  },
  "mercedes-benz:w206": {
    src: "/media/autospec/mercedes-w206.jpg",
    alt: "Mercedes-Benz C-Class W206 generation body",
    credit: "Dinkun Chen · Wikimedia Commons · CC BY-SA 4.0",
    note: "W206 generation body. Not a C220d-specific trim photo.",
  },
  "mercedes:w206": {
    src: "/media/autospec/mercedes-w206.jpg",
    alt: "Mercedes-Benz C-Class W206 generation body",
    credit: "Dinkun Chen · Wikimedia Commons · CC BY-SA 4.0",
    note: "W206 generation body. Not a C220d-specific trim photo.",
  },
  "audi:b9": {
    src: "/media/autospec/audi-a4-b9.jpg",
    alt: "Audi A4 B9 sedan",
    credit: "Alexander-93 · Wikimedia Commons · CC BY-SA 4.0",
    note: "B9 generation body.",
  },
  "peugeot:p21": {
    src: "/media/autospec/peugeot-308-p21.jpg",
    alt: "Peugeot 308 III / P21 generation",
    credit: "Thesupermat · Wikimedia Commons · CC BY-SA 4.0",
    note: "P21 generation body used for the 1.2 PureTech identity.",
  },
};

export function vehicleMediaOf(makeSlug: string, generationSlug: string): VehicleMedia | null {
  return VEHICLE_MEDIA[`${makeSlug}:${generationSlug}`] ?? null;
}
