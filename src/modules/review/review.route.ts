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

router.get("/", reviewController.getAllReviews)

export const reviewRoutes = router;
