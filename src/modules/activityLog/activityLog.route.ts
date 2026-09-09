import express from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { activityLogController } from "./activityLog.controller";
import { activityLogValidation } from "./activityLog.validation";


const router = express.Router();

router.get(
  "/:organizationId/activity-logs",
  authGuard,
  validateZodSchema(activityLogValidation.getActivityLogsSchema),
  activityLogController.getActivityLogs,
);

export default router;