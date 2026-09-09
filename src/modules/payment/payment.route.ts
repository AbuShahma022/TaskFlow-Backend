import express from "express";
import authGuard from "../../middleware/authGuard";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";
import validateZodSchema from "../../middleware/validateRequest";
import handleStripeWebhook from "./payment.webhook";


const router = express.Router();

router.post(
  "/:organizationId/payments",
  authGuard,
  validateZodSchema(paymentValidation.createPaymentSchema),
  paymentController.createPayment,
);

router.get(
  "/:organizationId/payments",
  authGuard,
  validateZodSchema(paymentValidation.getPaymentsSchema),
  paymentController.getPayments,
);

router.post(
  "/stripe/webhook",
  handleStripeWebhook,
);

export default router;