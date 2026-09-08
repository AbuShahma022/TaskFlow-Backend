export interface ICreateSubtask {
  title: string;
  description?: string;
  assignedToId?: string;
}

export interface IUpdateSubtask {
  title?: string;
  description?: string;
  assignedToId?: string | null;
}

export interface IUpdateSubtaskStatus {
  status: "TODO" | "IN_PROGRESS" | "DONE";
}