import { Router } from "express";
import { authController } from "./auth.controller";
import authGuard from "../../middleware/authGuard";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken)
router.get(
  "/me",
  authGuard(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  authController.getCurrentUser,
);

export const authRoutes = router;
