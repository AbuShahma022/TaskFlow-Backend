export interface IGetActivityLogsQuery {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
}