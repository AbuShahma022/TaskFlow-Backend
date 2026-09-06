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

router.post(
  "/send-verification-otp",
  authGuard,
  authController.sendVerificationOTP,
);

router.post(
  "/verify-email",
  authGuard,
  validateZodSchema(authValidation.verifyEmailSchema),
  authController.verifyEmail,
);

router.post(
  "/forgot-password",
  validateZodSchema(authValidation.forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/verify-reset-otp",
  validateZodSchema(authValidation.verifyResetOTPSchema),
  authController.verifyResetOTP,
);

router.post(
  "/reset-password",
  validateZodSchema(authValidation.resetPasswordSchema),
  authController.resetPassword,
);

router.post(
  "/google",
  validateZodSchema(authValidation.googleLoginSchema),
  authController.googleLogin,
);

export default router;