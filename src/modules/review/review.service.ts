import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { CreateReviewPayload, ReviewQuery } from "./review.validation";
import httpStatus from "http-status";

const createReviewIntoDB = async (
  userId: string,
  bookingId: string,
  payload: CreateReviewPayload,
) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: { payment: { select: { status: true } } },
  });

  if (!booking) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can't review a service you didn't book!",
    );
  }

  if (
    booking.status !== BookingStatus.COMPLETED ||
    booking.payment?.status !== PaymentStatus.PAID
  ) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You can only review a booking that is completed and you have paid for!",
    );
  }

  const isReviewAlreadyGiven = await prisma.review.findUnique({
    where: { bookingId: booking.id },
  });

  if (isReviewAlreadyGiven) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You can't review a booking twice!",
    );
  }

  const review = await prisma.review.create({
    data: {
      content: payload.content ?? "",
      givenStars: payload.givenStars,
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
