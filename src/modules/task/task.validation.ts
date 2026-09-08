import { z } from "zod";

const createTaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
  }),
  body: z.object({
    title: z.string().trim().min(2, "Task title is required"),
    description: z.string().trim().optional(),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .optional(),
    sprintId: z.string().uuid("Invalid sprint ID").optional(),
    assignedToId: z.string().uuid("Invalid user ID").optional(),
    dueDate: z.string().datetime("Invalid due date").optional(),
  }),
});

const getTasksSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    status: z
      .enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
      .optional(),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .optional(),
    sprintId: z.string().uuid("Invalid sprint ID").optional(),
    assignedToId: z.string().uuid("Invalid user ID").optional(),
  }),
});

const getTaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
});

const updateTaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
  body: z.object({
    title: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .optional(),
    sprintId: z.string().uuid("Invalid sprint ID").nullable().optional(),
    assignedToId: z.string().uuid("Invalid user ID").nullable().optional(),
    dueDate: z.string().datetime("Invalid due date").nullable().optional(),
  }),
});

const updateTaskStatusSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
  body: z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  }),
});

const assignTaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
  body: z.object({
    assignedToId: z.string().uuid("Invalid user ID").nullable(),
  }),
});

const deleteTaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
});

export const taskValidation = {
  createTaskSchema,
  getTasksSchema,
  getTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
  deleteTaskSchema,
};