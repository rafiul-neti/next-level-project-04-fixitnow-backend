import { z } from "zod";
import { BookingStatus, WeekendDays } from "../../../generated/prisma/enums";

export const getTechnicianQuerySchema = z.object({
  minHourlyRate: z.coerce.number().min(0).optional(),
  maxHourlyRate: z.coerce.number().min(0).optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  serviceAreas: z
    .string()
    .transform((v) => v.split(",").map((a) => a.trim()))
    .optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  weekendDays: z.enum(WeekendDays).optional(),
  searchTerm: z.string().optional(),
  limit: z.coerce.number().optional(),
  status: z.enum(BookingStatus).optional(),
});

export const updateTechnicianProfileSchema = z.object({
  profilePhoto: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.number().optional(),
  hourlyRate: z.number().optional(),
  serviceAreas: z
    .string()
    .transform((v) => v.split(",").map((a) => a.trim()))
    .optional(),
});

const timeStringSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    "Invalid time — hours must be 00-23 and minutes must be 00-59",
  );

export const updateAvailabilitySlotsSchema = z
  .object({
    weekendDays: z.enum(WeekendDays).optional(),
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: "startTime must be before endTime!",
      path: ["endTime"],
    },
  );

export const bookingStatusSchema = z.object({
  status: z.enum(BookingStatus),
});

export type TechnicianQuery = z.infer<typeof getTechnicianQuerySchema>;

export type UpdateTechnicianProfile = z.infer<
  typeof updateTechnicianProfileSchema
>;

export type UpdateAvailabilitySlots = z.infer<
  typeof updateAvailabilitySlotsSchema
>;

export type UpdateBookingStatus = z.infer<typeof bookingStatusSchema>;
