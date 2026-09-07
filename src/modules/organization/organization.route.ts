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

router.get(
  "/:id/members",
  authGuard,
  validateZodSchema(organizationValidation.getOrganizationMembersSchema),
  organizationController.getOrganizationMembers,
);

router.patch(
  "/:id",
  authGuard,
  validateZodSchema(organizationValidation.updateOrganizationSchema),
  organizationController.updateOrganization,
);

router.patch(
  "/:id/members/:memberId/role",
  authGuard,
  validateZodSchema(
    organizationValidation.updateOrganizationMemberRoleSchema,
  ),
  organizationController.updateOrganizationMemberRole,
);

router.post(
  "/",
  authGuard,
  validateZodSchema(organizationValidation.createOrganizationSchema),
  organizationController.createOrganization,
);

router.delete(
  "/:id/members/:memberId",
  authGuard,
  validateZodSchema(
    organizationValidation.removeOrganizationMemberSchema,
  ),
  organizationController.removeOrganizationMember,
);
export default router;