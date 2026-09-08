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

export interface IAddProjectMember {
  userId: string;
}

export interface IGetProjectMembersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IRemoveProjectMember {
  memberId: string;
}