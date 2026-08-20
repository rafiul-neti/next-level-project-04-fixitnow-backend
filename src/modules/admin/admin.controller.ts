import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";
import { categoryIdSchema, userIdSchema } from "./admin.validation";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllUsersFromDB();

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Retrieved all users successfully.",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllBookingsFromDB();

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Retrieved all bookings.",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllCategoriesFromDB();

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Retrieved all categories.",
    data: result,
  });
});

const adminDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAdminDashboardStats();

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Retrieved admin dashboard stats.",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = userIdSchema.parse(req.params);
  const result = await adminService.updateUserStatusByUserId(userId, req.body);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: result.data,
  });
});

const createNewCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.createNewCategoryIntoDB(req.body);

  sendSuccessResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "A new category created successfully.",
    data: result,
  });
});

const createNewService = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = categoryIdSchema.parse(req.params);

  const result = await adminService.createNewServiceIntoDB(
    categoryId,
    req.body,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "A new service created successfully.",
    data: result,
  });
});

export const adminController = {
  getAllUsers,
  getAllBookings,
  getAllCategories,
  adminDashboardStats,
  updateUserStatus,
  createNewCategory,
  createNewService,
};
