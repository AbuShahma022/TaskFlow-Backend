import { z } from "zod";

const getSubscriptionSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
});

const updateSubscriptionPlanSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
  body: z.object({
    plan: z.enum(["FREE", "PRO"]),
  }),
});

export const subscriptionValidation = {
  getSubscriptionSchema,
  updateSubscriptionPlanSchema,
};