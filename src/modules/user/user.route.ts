import { Router } from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";
import upload from "../../middleware/upload";

const router = Router();

router.patch(
  "/me",
  authGuard,
  upload.single("avatar"),
  validateZodSchema(userValidation.updateProfileSchema),
  userController.updateProfile,
);

export default router;