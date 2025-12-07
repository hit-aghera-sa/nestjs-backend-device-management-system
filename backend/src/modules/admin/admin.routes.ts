import { Router } from "express";
import AdminController from "./admin.controller";
import { validate } from "../../core/middleware/validation.middleware";
import { registerSchema, loginSchema } from "./admin.validator";

const router = Router();

router.post("/register", validate(registerSchema), AdminController.register);
router.post("/login", validate(loginSchema), AdminController.login);
router.get("/verify/:token", AdminController.verify);
router.post("/resend-verification", AdminController.resendVerification);

export default router;

