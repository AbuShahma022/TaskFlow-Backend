import { Router } from "express";
import authGuard from "../../../middleware/authGuard";
import validateZodSchema from "../../../middleware/validateRequest";
import { teamValidation } from "../team.validation";
import { teamController } from "./team.controller";


const router = Router();
router.get(
  "/:organizationId/teams",
  authGuard,
  validateZodSchema(teamValidation.getTeamsSchema),
  teamController.getTeams,
);

router.get(
  "/:organizationId/teams/:teamId",
  authGuard,
  validateZodSchema(teamValidation.getTeamSchema),
  teamController.getTeam,
);

router.patch(
  "/:organizationId/teams/:teamId",
  authGuard,
  validateZodSchema(teamValidation.updateTeamSchema),
  teamController.updateTeam,
);


router.post(
  "/:organizationId/teams",
  authGuard,
  validateZodSchema(teamValidation.createTeamSchema),
  teamController.createTeam,
);

router.delete(
  "/:organizationId/teams/:teamId",
  authGuard,
  validateZodSchema(teamValidation.deleteTeamSchema),
  teamController.deleteTeam,
);

export default router;