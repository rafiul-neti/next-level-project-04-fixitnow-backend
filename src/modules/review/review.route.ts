import { Router } from "express";
import authGuard from "../../middleware/authGuard";
import { Role } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";
import validateRequest from "../../middleware/validateRequest";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/:bookingId",
  authGuard(Role.CUSTOMER),
  validateRequest(createReviewSchema),
  reviewController.createReview,
);

router.get("/", reviewController.getAllReviews);

router.get(
  "/customer",
  authGuard(Role.CUSTOMER),
  reviewController.getReviewsByCustomerId,
);

router.get(
  "/technician",
  authGuard(Role.TECHNICIAN),
  reviewController.getReviewsByTechnicianId,
);

export const reviewRoutes = router;
