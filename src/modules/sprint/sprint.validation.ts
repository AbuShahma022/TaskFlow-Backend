import { z } from "zod";

const createSprintSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
  }),
  body: z.object({
    name: z.string().trim().min(2, "Sprint name is required"),
    goal: z.string().trim().optional(),
    startDate: z.string().datetime("Invalid start date"),
    endDate: z.string().datetime("Invalid end date"),
  }),
});

const getSprintsSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z
      .enum(["PLANNED", "ACTIVE", "COMPLETED", "ARCHIVED"])
      .optional(),
  }),
});

const getSprintSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    sprintId: z.string().uuid("Invalid sprint ID"),
  }),
});

const updateSprintSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    sprintId: z.string().uuid("Invalid sprint ID"),
  }),
  body: z.object({
    name: z.string().trim().min(2).optional(),
    goal: z.string().trim().optional(),
    startDate: z.string().datetime("Invalid start date").optional(),
    endDate: z.string().datetime("Invalid end date").optional(),
  }),
});

const startSprintSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    sprintId: z.string().uuid("Invalid sprint ID"),
  }),
});

const completeSprintSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    sprintId: z.string().uuid("Invalid sprint ID"),
  }),
});

const archiveSprintSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    projectId: z.string().uuid("Invalid project ID"),
    sprintId: z.string().uuid("Invalid sprint ID"),
  }),
});

export const sprintValidation = {
  createSprintSchema,
  getSprintsSchema,
  getSprintSchema,
  updateSprintSchema,
  startSprintSchema,
  completeSprintSchema,
  archiveSprintSchema,
};