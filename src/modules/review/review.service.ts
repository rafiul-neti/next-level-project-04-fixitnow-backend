import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { CreateReviewPayload, ReviewQuery } from "./review.validation";
import httpStatus from "http-status";

const createReviewIntoDB = async (
  userId: string,
  bookingId: string,
  payload: CreateReviewPayload,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      userId,
    },
  });

  if (!booking) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You can't review a service you didn't book!",
    );
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You can only review a completed booking!",
    );
  }

  const review = await prisma.review.create({
    data: {
      content: payload.content ?? "",
      givenStars: payload.rating,
      bookingId: booking.id,
      userId: booking.userId,
      technicianId: booking.technicianId,
    },
    omit: { userId: true, technicianId: true },
  });

  return review;
};

const getAllReviewsFromDB = async (query: ReviewQuery) => {
  const reviews = await prisma.review.findMany({
    select: {
      id: true,
      content: true,
      user: { select: { name: true } },
      givenStars: true,
    },
    ...(query.limit && { take: query.limit }),
  });

  return reviews;
};

const getCustomerReviewsByID = async (customerId: string) => {
  const reviews = await prisma.review.findMany({
    where: { userId: customerId },
  });

  return reviews;
};

const getTechniciansReviewsByID = async (technicianId: string) => {
  const reviews = await prisma.review.findMany({
    where: { technicianId },
  });

  return reviews;
};

export const reviewService = {
  createReviewIntoDB,
  getAllReviewsFromDB,
  getCustomerReviewsByID,
  getTechniciansReviewsByID,
};
