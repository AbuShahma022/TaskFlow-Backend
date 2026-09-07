export interface ICreateOrganization {
  name: string;
  slug: string;
  description?: string;
}

export interface IUpdateOrganization {
  name?: string;
  description?: string;
}