import { z } from "zod";
import { ActivityAction, ActivityEntityType } from "../../../generated/prisma/enums";

const getActivityLogsSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    action: z.nativeEnum(ActivityAction).optional(),
    entityType: z.nativeEnum(ActivityEntityType).optional(),
    userId: z.string().uuid("Invalid user ID").optional(),
  }),
});

export const activityLogValidation = {
  getActivityLogsSchema,
};