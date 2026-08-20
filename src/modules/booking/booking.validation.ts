import { z } from "zod";
import { WhereAbout } from "../../../generated/prisma/enums";

const createBookingWithExistingAddressSchema = z.object({
  serviceId: z.uuid(),
  technicianId: z.uuid(),
  useExistingAddress: z.literal(true),
  addressId: z.uuid().optional(),
});

const createBookingWithNewAddressSchema = z.object({
  serviceId: z.uuid(),
  technicianId: z.uuid(),
  useExistingAddress: z.literal(false),
  address_line_1: z.string(),
  address_line_2: z.string().optional(),
  postCode: z.string(),
  city: z.string(),
  region: z.string(),
  whereAbout: z.enum(WhereAbout).optional(),
});

export const createBookingSchema = z.discriminatedUnion("useExistingAddress", [
  createBookingWithExistingAddressSchema,
  createBookingWithNewAddressSchema,
]);

export const idSchema = z.object({
  id: z.uuid(),
});

export const bookingQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingQuery = z.infer<typeof bookingQuerySchema>;
