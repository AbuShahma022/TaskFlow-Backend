export interface ICreateTeam {
  name: string;
  description?: string;
}

export interface IUpdateTeam {
  name?: string;
  description?: string;
}

export interface IGetTeamsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IAddTeamMember {
  userId: string;
}