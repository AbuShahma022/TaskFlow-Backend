import { Router } from "express";

import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { organizationController } from "./organization.controller";
import { organizationValidation } from "./organization.validation";

const router = Router();
router.get(
  "/",
  authGuard,
  validateZodSchema(organizationValidation.getMyOrganizationsSchema),
  organizationController.getMyOrganizations,
);

router.get(
  "/:id",
  authGuard,
  validateZodSchema(organizationValidation.getOrganizationByIdSchema),
  organizationController.getOrganizationById,
);

router.patch(
  "/:id",
  authGuard,
  validateZodSchema(organizationValidation.updateOrganizationSchema),
  organizationController.updateOrganization,
);

router.post(
  "/",
  authGuard,
  validateZodSchema(organizationValidation.createOrganizationSchema),
  organizationController.createOrganization,
);

export default router;