import express from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { commentController } from "./comment.controller";
import { commentValidation } from "./comment.validation";


const router = express.Router();



router.get(
  "/:organizationId/projects/:projectId/tasks/:taskId/comments",
  authGuard,
  validateZodSchema(commentValidation.getCommentsSchema),
  commentController.getComments,
);


router.patch(
  "/:organizationId/projects/:projectId/tasks/:taskId/comments/:commentId",
  authGuard,
  validateZodSchema(commentValidation.updateCommentSchema),
  commentController.updateComment,
);

router.post(
  "/:organizationId/projects/:projectId/tasks/:taskId/comments",
  authGuard,
  validateZodSchema(commentValidation.createCommentSchema),
  commentController.createComment,
);

router.delete(
  "/:organizationId/projects/:projectId/tasks/:taskId/comments/:commentId",
  authGuard,
  validateZodSchema(commentValidation.deleteCommentSchema),
  commentController.deleteComment,
);

export default router;