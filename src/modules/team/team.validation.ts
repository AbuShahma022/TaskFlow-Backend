import { z } from "zod";

const createTeamSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
  body: z.object({
    name: z.string().trim().min(2, "Team name is required"),
    description: z.string().trim().optional(),
  }),
});

const getTeamsSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
  }),
});

const getTeamSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    teamId: z.string().uuid("Invalid team ID"),
  }),
});

const updateTeamSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    teamId: z.string().uuid("Invalid team ID"),
  }),
  body: z.object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
  }),
});

const deleteTeamSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    teamId: z.string().uuid("Invalid team ID"),
  }),
});

const addTeamMemberSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    teamId: z.string().uuid("Invalid team ID"),
  }),
  body: z.object({
    userId: z.string().uuid("Invalid user ID"),
  }),
});

const getTeamMembersSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    teamId: z.string().uuid("Invalid team ID"),
  }),
});

const removeTeamMemberSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
    teamId: z.string().uuid("Invalid team ID"),
    memberId: z.string().uuid("Invalid team member ID"),
  }),
});

export const teamValidation = {
  createTeamSchema,
  getTeamsSchema,
  getTeamSchema,
  updateTeamSchema,
  deleteTeamSchema,
  addTeamMemberSchema,
  getTeamMembersSchema,
  removeTeamMemberSchema,
};