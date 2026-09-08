import express from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { taskController } from "./task.controller";
import { taskValidation } from "./task.validation";

const router = express.Router();

router.get(
  "/:organizationId/projects/:projectId/tasks",
  authGuard,
  validateZodSchema(taskValidation.getTasksSchema),
  taskController.getTasks,
);

router.post(
  "/:organizationId/projects/:projectId/tasks",
  authGuard,
  validateZodSchema(taskValidation.createTaskSchema),
  taskController.createTask,
);

export default router;