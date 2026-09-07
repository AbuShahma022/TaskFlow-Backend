import { Router } from "express";
import authGuard from "../../middleware/authGuard";
import validateZodSchema from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";
import upload from "../../middleware/upload";
import { UserRole } from "../../../generated/prisma/client";
import auth from "../../middleware/auth";

const router = Router();

router.get(
  "/",
  authGuard,
  auth(UserRole.ADMIN),
  validateZodSchema(userValidation.getAllUsersSchema),
  userController.getAllUsers,
);

router.patch(
  "/me",
  authGuard,
  upload.single("avatar"),
  validateZodSchema(userValidation.updateProfileSchema),
  userController.updateProfile,
);

router.patch(
  "/change-password",
  authGuard,
  validateZodSchema(userValidation.changePasswordSchema),
  userController.changePassword,
);

router.patch(
  "/:id/status",
  authGuard,
  auth(UserRole.ADMIN),
  validateZodSchema(userValidation.updateUserStatusSchema),
  userController.updateUserStatus,
);

router.delete(
  "/:id",
  authGuard,
  auth(UserRole.ADMIN),
  validateZodSchema(userValidation.deleteUserSchema),
  userController.deleteUser,
);

export default router;