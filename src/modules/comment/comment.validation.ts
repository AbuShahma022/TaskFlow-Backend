import { z } from "zod";

const createCommentSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
  body: z.object({
    content: z.string().trim().min(1, "Comment content is required"),
  }),
});

const getCommentsSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
  }),
});

const updateCommentSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
    commentId: z.string().uuid("Invalid comment ID"),
  }),
  body: z.object({
    content: z.string().trim().min(1, "Comment content is required"),
  }),
});

const deleteCommentSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    taskId: z.string().uuid("Invalid task ID"),
    commentId: z.string().uuid("Invalid comment ID"),
  }),
});

export const commentValidation = {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
  deleteCommentSchema,
};