import { Router } from "express";
import { authController } from "./auth.controller";
import validateZodSchema from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";

const router = Router();

router.post("/register", validateZodSchema(authValidation.registerSchema), authController.register);

export default router;