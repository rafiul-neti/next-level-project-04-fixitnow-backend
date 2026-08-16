import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { technicianService } from "./technician.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getAllTechniciansFromDB(
    req.validatedQuery,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Retrieved all technicians successfully.",
    data: result,
  });
});

const getSingleTechnician = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await technicianService.getSingleTechnicianByID(id as string);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Technician retrieved successfully",
    data: result,
  });
});

const getTechnicianDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getTechnicianDetailsFromDB(
    req.params.technicianId as string,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Retrieved technician details.",
    data: result,
  });
});

const updateTechnicianProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await technicianService.updateTechnicianProfileByTechnicianId(
        req.user?.id as string,
        req.body,
      );

    sendSuccessResponse(res, {
      statusCode: httpStatus.OK,
      message: "Technician user's profile updated successfully.",
      data: result,
    });
  },
);

const updateAvailabilitySlots = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await technicianService.updateAvailabilitySlotsByTechnicianId(
        req.user?.id as string,
        req.body,
      );

    sendSuccessResponse(res, {
      statusCode: httpStatus.OK,
      message: "Technician user's availability slots updated successfully.",
      data: result,
    });
  },
);

const getTechnicianBookings = catchAsync(
  async (req: Request, res: Response) => {
    const result = await technicianService.getTechnicianBookingsByTechnicianId(
      req.user?.id as string,
    );

    sendSuccessResponse(res, {
      statusCode: httpStatus.OK,
      message: "Retrieved technician user's bookings successfully.",
      data: result,
    });
  },
);

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.updateBookingStatusByBookingId(
    req.user?.id as string,
    req.params.bookingId as string,
    req.body,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: result.data,
  });
});

export const technicianController = {
  getAllTechnicians,
  getSingleTechnician,
  getTechnicianDetails,
  updateTechnicianProfile,
  updateAvailabilitySlots,
  getTechnicianBookings,
  updateBookingStatus,
};
