export interface ICreateProject {
  name: string;
  description?: string;
}

export interface IUpdateProject {
  name?: string;
  description?: string;
}

export interface IGetProjectsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "ARCHIVED";
}