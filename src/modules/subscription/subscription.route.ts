import express from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { subscriptionController } from "./subscription.controller";
import { subscriptionValidation } from "./subscription.validation";


const router = express.Router();

router.get(
  "/:organizationId/subscription",
  authGuard,
  validateZodSchema(subscriptionValidation.getSubscriptionSchema),
  subscriptionController.getSubscription,
);

router.patch(
  "/:organizationId/subscription",
  authGuard,
  validateZodSchema(subscriptionValidation.updateSubscriptionPlanSchema),
  subscriptionController.updateSubscriptionPlan,
);

export default router;