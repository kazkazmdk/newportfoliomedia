export type SponsorCampaign = {
  id: string;
  site: string;
  label: string;
  startsAt: string;
  endsAt: string;
  disclosure: string;
  status: "draft";
};

export type Placement = {
  id: string;
  campaignId: string;
  surface: string;
  creativeId: string;
};

/** Sponsored rows cannot change an engine answer. */
export function sponsoredCannotAlterEngine(engineAnswer: unknown, sponsored: unknown): unknown {
  void sponsored;
  return engineAnswer;
}
