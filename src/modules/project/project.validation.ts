import { z } from "zod";

const createProjectSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
  body: z.object({
    name: z.string().trim().min(2, "Project name is required"),
    description: z.string().trim().optional(),
  }),
});

const getProjectsSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  }),
});

const getProjectSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
  }),
});

const updateProjectSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
  }),
  body: z.object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
  }),
});

const archiveProjectSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
  }),
});

export const projectValidation = {
  createProjectSchema,
  getProjectsSchema,
  getProjectSchema,
  updateProjectSchema,
  archiveProjectSchema,
};