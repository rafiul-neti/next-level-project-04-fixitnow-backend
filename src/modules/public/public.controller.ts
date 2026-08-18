import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { publicService } from "./public.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";
import { serviceIdSchema } from "./public.validation";

const getTechniciansForAService = catchAsync(
  async (req: Request, res: Response) => {
    const params = serviceIdSchema.parse(req.params);
    const result = await publicService.getTechniciansForAServiceByID(params);

    sendSuccessResponse(res, {
      statusCode: httpStatus.OK,
      message: "Technicians retrieved for a service.",
      data: result,
    });
  },
);

export const publicController = { getTechniciansForAService };
