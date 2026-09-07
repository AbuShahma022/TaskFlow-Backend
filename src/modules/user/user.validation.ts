import { z } from "zod";

const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must not exceed 100 characters")
      .optional(),
  }),
});
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password must not exceed 100 characters"),
  }),
});

const getAllUsersSchema = z.object({
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
      .max(100, "Limit must not exceed 100")
      .optional(),

    search: z.string().trim().optional(),

    role: z.enum(["ADMIN", "USER"]).optional(),

    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),

    sortBy: z
      .enum(["name", "email", "createdAt"])
      .optional(),

    sortOrder: z
      .enum(["asc", "desc"])
      .optional(),
  }),
});

const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "BLOCKED"]),
  }),
});

const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
});

export const userValidation = {
  updateProfileSchema,
  changePasswordSchema,
  getAllUsersSchema,
  updateUserStatusSchema,
  deleteUserSchema,
};