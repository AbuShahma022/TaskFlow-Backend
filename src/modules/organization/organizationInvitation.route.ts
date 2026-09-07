import { Router } from "express";

import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { organizationInvitationController } from "./organizationInvitation.controller";
import { organizationInvitationValidation } from "./organizationInvitation.validation";

const router = Router();

router.get(
  "/invitations/me",
  authGuard,
  validateZodSchema(
    organizationInvitationValidation.getMyInvitationsSchema,
  ),
  organizationInvitationController.getMyInvitations,
);

router.get(
  "/:id/invitations",
  authGuard,
  validateZodSchema(
    organizationInvitationValidation.getOrganizationInvitationsSchema,
  ),
  organizationInvitationController.getOrganizationInvitations,
);
router.patch(
  "/invitations/:id",
  authGuard,
  validateZodSchema(
    organizationInvitationValidation.respondToOrganizationInvitationSchema,
  ),
  organizationInvitationController.respondToOrganizationInvitation,
);

router.patch(
  "/invitations/:id/cancel",
  authGuard,
  validateZodSchema(
    organizationInvitationValidation.cancelOrganizationInvitationSchema,
  ),
  organizationInvitationController.cancelOrganizationInvitation,
);

router.post(
  "/:id/invitations",
  authGuard,
  validateZodSchema(
    organizationInvitationValidation.createOrganizationInvitationSchema,
  ),
  organizationInvitationController.createOrganizationInvitation,
);

export default router;