import { WhereAbout } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { BookingQuery, CreateBookingInput } from "./booking.validation";
import httpStatus from "http-status";

const createBookingIntoDB = async (
  userId: string,
  payload: CreateBookingInput,
) => {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found!");
  }

  const createdBooking = await prisma.$transaction(async (tx) => {
    const technicianService = await tx.technicianService.findUnique({
      where: {
        technicianId_serviceId: {
          serviceId: payload.serviceId,
          technicianId: payload.technicianId,
        },
      },
    });

    if (!technicianService || !technicianService.isActive) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This technician does not offer this sesrvice!",
      );
    }

    let addressId: string;
    if (payload.useExistingAddress) {
      const address = await tx.address.findUnique({
        where: { id: payload.addressId },
      });

      if (!address) {
        throw new AppError(httpStatus.NOT_FOUND, "Address not found!");
      }

      if (address.userId !== userId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You can't use an address that isn't yours!",
        );
      }

      addressId = address.id;
    } else {
      const address = await tx.address.upsert({
        where: {
          userId_whereAbout: {
            userId,
            whereAbout: payload.whereAbout ?? WhereAbout.HOME,
          },
        },
        update: {
          address_line_1: payload.address_line_1,
          address_line_2: payload.address_line_2,
          postCode: payload.postCode,
          city: payload.city,
          region: payload.region,
        },
        create: {
          userId,
          address_line_1: payload.address_line_1,
          address_line_2: payload.address_line_2,
          postCode: payload.postCode,
          city: payload.city,
          region: payload.region,
          whereAbout: payload.whereAbout ?? WhereAbout.HOME,
        },
      });

      addressId = address.id;
    }

    const booking = await tx.booking.create({
      data: {
        userId,
        serviceId: payload.serviceId,
        technicianId: payload.technicianId,
        addressId,
      },
      include: {
        service: {
          select: {
            name: true,
            description: true,
            category: { select: { name: true } },
          },
        },
        technician: {
          omit: { id: true, userId: true, createdAt: true, updatedAt: true },
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        address: {
          select: {
            address_line_1: true,
            address_line_2: true,
            city: true,
            postCode: true,
            region: true,
          },
        },
      },

      omit: { createdAt: true, updatedAt: true },
    });

    return booking;
  });

  return createdBooking;
};

const getAllBookingsFromDB = async (userId: string, query: BookingQuery) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      service: { select: { name: true } },
      technician: { select: { user: { select: { name: true } } } },
      address: { select: { city: true, region: true } },
    },
    ...(query.sortBy && {
      orderBy: { [query.sortBy]: query.sortOrder ? query.sortOrder : "desc" },
    }),
  });

  return bookings;
};

const getSingleBookingById = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { name: true, category: { select: { name: true } } } },
      technician: {
        select: {
          user: { select: { name: true } },
          hourlyRate: true,
          experienceYears: true,
          availability: {
            select: { startTime: true, endTime: true, weekendDays: true },
          },
        },
      },
      address: {
        omit: { id: true, userId: true, createdAt: true, updatedAt: true },
      },
    },
  });
  if (!booking) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Booking details not found! Please try again.",
    );
  }

  return booking;
};

export const bookingService = {
  createBookingIntoDB,
  getAllBookingsFromDB,
  getSingleBookingById,
};
