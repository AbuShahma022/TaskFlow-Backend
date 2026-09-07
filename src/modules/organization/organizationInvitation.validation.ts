import { z } from "zod";

const createOrganizationInvitationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
  }),
  body: z.object({
    email: z.string().trim().email("Invalid email address"),
  }),
});

export const organizationInvitationValidation = {
  createOrganizationInvitationSchema,
};