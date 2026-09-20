export const ROLES = ["OWNER", "ADMIN", "DEVELOPER", "ANALYST", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const API_ENVIRONMENTS = ["development", "production"] as const;
export type ApiEnvironment = (typeof API_ENVIRONMENTS)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type PlatformUser = {
  id: string;
  email: string;
  displayName: string;
  kind: "local_dev" | "external";
  createdAt: string;
};

export type Membership = {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt: string;
};

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 1,
  ANALYST: 2,
  DEVELOPER: 3,
  ADMIN: 4,
  OWNER: 5,
};

export function roleAtLeast(have: Role, needed: Role): boolean {
  return ROLE_RANK[have] >= ROLE_RANK[needed];
}

export function assertRole(have: Role, needed: Role): void {
  if (!roleAtLeast(have, needed)) throw new Error(`role_${have}_cannot_${needed}`);
}
