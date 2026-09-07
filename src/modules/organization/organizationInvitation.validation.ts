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

export const organizationInvitationValidation = {
  createOrganizationInvitationSchema,
  respondToOrganizationInvitationSchema
};