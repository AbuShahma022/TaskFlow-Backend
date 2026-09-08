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

router.get(
  "/:organizationId/projects/:projectId/sprints/:sprintId",
  authGuard,
  validateZodSchema(sprintValidation.getSprintSchema),
  sprintController.getSprint,
);

router.patch(
  "/:organizationId/projects/:projectId/sprints/:sprintId",
  authGuard,
  validateZodSchema(sprintValidation.updateSprintSchema),
  sprintController.updateSprint,
);

router.patch(
  "/:organizationId/projects/:projectId/sprints/:sprintId/start",
  authGuard,
  validateZodSchema(sprintValidation.startSprintSchema),
  sprintController.startSprint,
);

router.patch(
  "/:organizationId/projects/:projectId/sprints/:sprintId/complete",
  authGuard,
  validateZodSchema(sprintValidation.completeSprintSchema),
  sprintController.completeSprint,
);

router.patch(
  "/:organizationId/projects/:projectId/sprints/:sprintId/archive",
  authGuard,
  validateZodSchema(sprintValidation.archiveSprintSchema),
  sprintController.archiveSprint,
);

router.post(
  "/:organizationId/projects/:projectId/sprints",
  authGuard,
  validateZodSchema(sprintValidation.createSprintSchema),
  sprintController.createSprint,
);

export default router;