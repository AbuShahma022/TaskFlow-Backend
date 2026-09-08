import express from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { subtaskController } from "./subtask.controller";
import { subtaskValidation } from "./subtask.validation";


const router = express.Router();

router.get(
  "/:organizationId/projects/:projectId/tasks/:taskId/subtasks",
  authGuard,
  validateZodSchema(subtaskValidation.getSubtasksSchema),
  subtaskController.getSubtasks,
);

router.patch(
  "/:organizationId/projects/:projectId/tasks/:taskId/subtasks/:subtaskId",
  authGuard,
  validateZodSchema(subtaskValidation.updateSubtaskSchema),
  subtaskController.updateSubtask,
);

router.patch(
  "/:organizationId/projects/:projectId/tasks/:taskId/subtasks/:subtaskId/status",
  authGuard,
  validateZodSchema(subtaskValidation.updateSubtaskStatusSchema),
  subtaskController.updateSubtaskStatus,
);


router.post(
  "/:organizationId/projects/:projectId/tasks/:taskId/subtasks",
  authGuard,
  validateZodSchema(subtaskValidation.createSubtaskSchema),
  subtaskController.createSubtask,
);

router.delete(
  "/:organizationId/projects/:projectId/tasks/:taskId/subtasks/:subtaskId",
  authGuard,
  validateZodSchema(subtaskValidation.deleteSubtaskSchema),
  subtaskController.deleteSubtask,
);

export default router;