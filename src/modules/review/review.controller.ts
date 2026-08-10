import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import { reviewService } from "./review.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import { bookingIdSchema, reviewLimitSchema } from "./review.validation";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = bookingIdSchema.parse(req.params);
  const result = await reviewService.createReviewIntoDB(
    req.user?.id as string,
    bookingId,
    req.body,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Review & rating submitted successfully.",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const query = reviewLimitSchema.parse(req.query);
  const result = await reviewService.getAllReviewsFromDB(query);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Retrieved all reviews successfully.",
    data: result,
  });
});

export const reviewController = { createReview, getAllReviews };
