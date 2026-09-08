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

router.get(
  "/:organizationId/projects/:projectId/members",
  authGuard,
  validateZodSchema(projectValidation.getProjectMembersSchema),
  projectController.getProjectMembers,
);

router.patch(
  "/:organizationId/projects/:projectId",
  authGuard,
  validateZodSchema(projectValidation.updateProjectSchema),
  projectController.updateProject,
);

router.patch(
  "/:organizationId/projects/:projectId/archive",
  authGuard,
  validateZodSchema(projectValidation.archiveProjectSchema),
  projectController.archiveProject,
);

router.post(
  "/:organizationId/projects",
  authGuard,
  validateZodSchema(projectValidation.createProjectSchema),
  projectController.createProject,
);

router.post(
  "/:organizationId/projects/:projectId/members",
  authGuard,
  validateZodSchema(projectValidation.addProjectMemberSchema),
  projectController.addProjectMember,
);

router.delete(
  "/:organizationId/projects/:projectId/members/:memberId",
  authGuard,
  validateZodSchema(projectValidation.removeProjectMemberSchema),
  projectController.removeProjectMember,
);

export default router;