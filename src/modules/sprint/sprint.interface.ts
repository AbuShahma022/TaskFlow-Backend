export interface ICreateSprint {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
}

export interface IUpdateSprint {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface IGetSprintsQuery {
  page?: number;
  limit?: number;
  status?: "PLANNED" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
}