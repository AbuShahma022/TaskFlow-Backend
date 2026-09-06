import { Router } from "express";
import { authController } from "./auth.controller";
import validateZodSchema from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";
import authGuard from "../../middleware/authGuard";

const router = Router();

router.post("/register", validateZodSchema(authValidation.registerSchema), authController.register);
router.post(
  "/login",
  validateZodSchema(authValidation.loginSchema),
  authController.login,
);

router.get(
  "/me",
  authGuard,
  authController.getMe,
);

router.post(
  "/logout",
  authController.logout,
);

router.post(
  "/refresh",
  authController.refreshToken,
);

export default router;