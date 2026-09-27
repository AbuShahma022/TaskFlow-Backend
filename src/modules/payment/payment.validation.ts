import { z } from "zod";

const createPaymentSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
});

const getPaymentsSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid("Invalid organization ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum([
      "PENDING",
      "PAID",
      "FAILED",
      "CANCELLED",
    ]).optional(),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    sessionId: z
      .string()
      .min(1, "Stripe session ID is required"),
  }),
  params: z.object({
    organizationId: z
      .string()
      .uuid("Invalid organization ID"),
  }),
});

export const paymentValidation = {
  createPaymentSchema,
  getPaymentsSchema,
  verifyPaymentSchema
};