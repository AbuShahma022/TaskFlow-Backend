import { Router } from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { sprintController } from "./sprint.controller";
import { sprintValidation } from "./sprint.validation";


const router = Router();

router.get(
  "/:organizationId/projects/:projectId/sprints",
  authGuard,
  validateZodSchema(sprintValidation.getSprintsSchema),
  sprintController.getSprints,
);

router.post(
  "/:organizationId/projects/:projectId/sprints",
  authGuard,
  validateZodSchema(sprintValidation.createSprintSchema),
  sprintController.createSprint,
);

export default router;