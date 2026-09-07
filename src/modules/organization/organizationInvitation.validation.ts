import { z } from "zod";

const createOrganizationInvitationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
  }),
  body: z.object({
    email: z.string().trim().email("Invalid email address"),
  }),
});

const respondToOrganizationInvitationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid invitation ID"),
  }),
  body: z.object({
    status: z.enum(["ACCEPTED", "REJECTED"]),
  }),
});

const getMyInvitationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z
      .enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"])
      .optional(),
  }),
});

const getOrganizationInvitationsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z
      .enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"])
      .optional(),
  }),
});

export const organizationInvitationValidation = {
  createOrganizationInvitationSchema,
  respondToOrganizationInvitationSchema,
  getMyInvitationsSchema,
  getOrganizationInvitationsSchema
};