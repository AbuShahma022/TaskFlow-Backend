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

router.get(
  "/:organizationId/projects/:projectId/tasks/:taskId",
  authGuard,
  validateZodSchema(taskValidation.getTaskSchema),
  taskController.getTask,
);

router.patch(
  "/:organizationId/projects/:projectId/tasks/:taskId",
  authGuard,
  validateZodSchema(taskValidation.updateTaskSchema),
  taskController.updateTask,
);

router.patch(
  "/:organizationId/projects/:projectId/tasks/:taskId/status",
  authGuard,
  validateZodSchema(taskValidation.updateTaskStatusSchema),
  taskController.updateTaskStatus,
);

router.patch(
  "/:organizationId/projects/:projectId/tasks/:taskId/assign",
  authGuard,
  validateZodSchema(taskValidation.assignTaskSchema),
  taskController.assignTask,
);

router.post(
  "/:organizationId/projects/:projectId/tasks",
  authGuard,
  validateZodSchema(taskValidation.createTaskSchema),
  taskController.createTask,
);

router.delete(
  "/:organizationId/projects/:projectId/tasks/:taskId",
  authGuard,
  validateZodSchema(taskValidation.deleteTaskSchema),
  taskController.deleteTask,
);

export default router;