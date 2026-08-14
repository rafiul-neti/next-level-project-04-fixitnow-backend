import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../utils/AppError";
import { handlePrismaErrors } from "../utils/handlePrismaErrors";
import { ZodError } from "zod";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = "Something went wrong!";
  let errorDetails: unknown = undefined;

  if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorDetails = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorDetails = error.details;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaErrors(error);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid data provided.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  console.log(error);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails,
    error: error.stack,
  });
};
