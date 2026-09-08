import { Router } from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { projectController } from "./project.controller";
import { projectValidation } from "./project.validation";



const router = Router();

router.get(
  "/:organizationId/projects",
  authGuard,
  validateZodSchema(projectValidation.getProjectsSchema),
  projectController.getProjects,
);


router.get(
  "/:organizationId/projects/:projectId",
  authGuard,
  validateZodSchema(projectValidation.getProjectSchema),
  projectController.getProject,
);

router.post(
  "/:organizationId/projects",
  authGuard,
  validateZodSchema(projectValidation.createProjectSchema),
  projectController.createProject,
);

export default router;