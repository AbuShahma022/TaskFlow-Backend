import { z } from "zod";

const createSubtaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
  body: z.object({
    title: z.string().trim().min(2, "Subtask title is required"),
    description: z.string().trim().optional(),
    assignedToId: z.string().uuid("Invalid user ID").optional(),
  }),
});

const getSubtasksSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
});

const getSubtaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
    subtaskId: z.string().uuid("Invalid subtask ID"),
  }),
});

const updateSubtaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
    subtaskId: z.string().uuid("Invalid subtask ID"),
  }),
  body: z.object({
    title: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
    assignedToId: z.string().uuid("Invalid user ID").nullable().optional(),
  }),
});

const updateSubtaskStatusSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
    subtaskId: z.string().uuid("Invalid subtask ID"),
  }),
  body: z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  }),
});

const deleteSubtaskSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
    subtaskId: z.string().uuid("Invalid subtask ID"),
  }),
});

export const subtaskValidation = {
  createSubtaskSchema,
  getSubtasksSchema,
  getSubtaskSchema,
  updateSubtaskSchema,
  updateSubtaskStatusSchema,
  deleteSubtaskSchema,
};