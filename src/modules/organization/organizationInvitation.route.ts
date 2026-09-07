import { Router } from "express";

import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { organizationInvitationController } from "./organizationInvitation.controller";
import { organizationInvitationValidation } from "./organizationInvitation.validation";

const router = Router();

router.post(
  "/:id/invitations",
  authGuard,
  validateZodSchema(
    organizationInvitationValidation.createOrganizationInvitationSchema,
  ),
  organizationInvitationController.createOrganizationInvitation,
);

export default router;