import { Router } from "express";
import authGuard from "../../middleware/authGuard";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { createCategorySchema, createServiceSchema, userStatusSchema } from "./admin.validation";

const router = Router();

router.get("/users", authGuard(Role.ADMIN), adminController.getAllUsers);

router.get("/bookings", authGuard(Role.ADMIN), adminController.getAllBookings);

router.get(
  "/categories",
  authGuard(Role.ADMIN),
  adminController.getAllCategories,
);

router.get(
  "/dashboard",
  authGuard(Role.ADMIN),
  adminController.adminDashboardStats,
);

router.post(
  "/categories",
  authGuard(Role.ADMIN),
  validateRequest(createCategorySchema),
  adminController.createNewCategory,
);

router.post(
  "/categories/:categoryId/services",
  authGuard(Role.ADMIN),
  validateRequest(createServiceSchema),
  adminController.createNewService,
);

router.patch(
  "/users/:userId",
  authGuard(Role.ADMIN),
  validateRequest(userStatusSchema),
  adminController.updateUserStatus,
);

export const adminRoutes = router;
