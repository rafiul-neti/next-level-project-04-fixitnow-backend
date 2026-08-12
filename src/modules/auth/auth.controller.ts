import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUserIntoDB(req.body);

  sendSuccessResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "User registered successfully.",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, role } =
    await authService.loginUserIntoApp(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "User successfully logged in.",
    data: { accessToken, refreshToken, role },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await authService.refreshToken(refreshToken);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Token refreshed successfully.",
    data: result,
  });
});

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as JwtPayload;
  const user = await authService.getCurrentUserFromDB(id as string, role);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: user,
  });
});

export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  getCurrentUser,
};
