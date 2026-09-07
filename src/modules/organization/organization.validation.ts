import { z } from "zod";

const createOrganizationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Organization name must be at least 2 characters")
      .max(100, "Organization name cannot exceed 100 characters"),

    slug: z
      .string()
      .trim()
      .min(2, "Organization slug must be at least 2 characters")
      .max(100, "Organization slug cannot exceed 100 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  }),
});

const getMyOrganizationsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, "Page must be at least 1")
      .optional(),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .optional(),

    search: z.string().trim().optional(),
  }),
});
const getOrganizationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
  }),
});

const updateOrganizationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Organization name must be at least 2 characters")
      .max(100, "Organization name cannot exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  }),
});


const getOrganizationMembersSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    role: z.enum(["MANAGER", "MEMBER"]).optional(),
  }),
});

const updateOrganizationMemberRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
    memberId: z.string().uuid("Invalid member ID"),
  }),
  body: z.object({
    role: z.enum(["MANAGER", "MEMBER"]),
  }),
});

const removeOrganizationMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
    memberId: z.string().uuid("Invalid member ID"),
  }),
});


export const organizationValidation = {
  createOrganizationSchema,
    getMyOrganizationsSchema,
    getOrganizationByIdSchema,
    updateOrganizationSchema,
    getOrganizationMembersSchema,
    updateOrganizationMemberRoleSchema,
    removeOrganizationMemberSchema,
};