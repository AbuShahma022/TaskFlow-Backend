export interface ICreateTask {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  sprintId?: string;
  assignedToId?: string;
  dueDate?: string;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  sprintId?: string | null;
  assignedToId?: string | null;
  dueDate?: string | null;
}

export interface IGetTasksQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  sprintId?: string;
  assignedToId?: string;
}

export interface IUpdateTaskStatus {
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
}

export interface IAssignTask {
  assignedToId: string | null;
}