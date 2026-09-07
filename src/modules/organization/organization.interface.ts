export interface ICreateOrganization {
  name: string;
  slug: string;
  description?: string;
}

export interface IUpdateOrganization {
  name?: string;
  description?: string;
}

export interface ICreateOrganizationInvitation {
  email: string;
}

export interface IUpdateOrganizationMemberRole {
  role: "MANAGER" | "MEMBER";
}

export interface IGetOrganizationMembersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: "MANAGER" | "MEMBER";
}