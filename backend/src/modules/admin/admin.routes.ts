import { Router } from "express";
import AdminController from "./admin.controller";
import { validate } from "../../core/middleware/validation.middleware";
import { 
  registerSchema, 
  loginSchema, 
  resendVerificationSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateAdminSchema
} from "./admin.validator";
import authMiddleware from "../../core/middleware/auth.middleware";
import roleMiddleware from "../../core/middleware/role.middleware";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), AdminController.register);
router.post("/login", validate(loginSchema), AdminController.login);
router.get("/verify/:token", AdminController.verify);
router.post("/resend-verification", validate(resendVerificationSchema), AdminController.resendVerification);

// Protected routes (regular admin)
router.get("/me", authMiddleware, AdminController.me);

router.patch(
  "/update",
  authMiddleware,
  validate(updateProfileSchema),
  AdminController.updateProfile
);

router.patch(
  "/change-password",
  authMiddleware,
  validate(changePasswordSchema),
  AdminController.changePassword
);

// Master admin only routes
router.get(
  "/admins",
  authMiddleware,
  roleMiddleware("MASTER"),
  AdminController.getAllAdmins
);

router.get(
  "/admins/:id",
  authMiddleware,
  roleMiddleware("MASTER"),
  AdminController.getAdminById
);

router.patch(
  "/admins/:id",
  authMiddleware,
  roleMiddleware("MASTER"),
  validate(updateAdminSchema),
  AdminController.updateAdmin
);

router.patch(
  "/admins/:id/deactivate",
  authMiddleware,
  roleMiddleware("MASTER"),
  AdminController.deactivateAdmin
);

router.patch(
  "/admins/:id/activate",
  authMiddleware,
  roleMiddleware("MASTER"),
  AdminController.activateAdmin
);

router.post("/logout", authMiddleware, AdminController.logout);

export default router;
