import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { bookingService } from "./booking.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";
import { bookingQuerySchema, idSchema } from "./booking.validation";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.createBookingIntoDB(
    req.user?.id as string,
    req.body,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Service booked successfully.",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const query = bookingQuerySchema.parse(req.query);
  const result = await bookingService.getAllBookingsFromDB(
    req.user?.id as string,
    query,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully.",
    data: result,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = idSchema.parse(req.params);
  const result = await bookingService.getSingleBookingById(id);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Booking details retrieved successfully.",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
};
