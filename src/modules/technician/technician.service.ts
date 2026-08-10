import { BookingStatus } from "../../../generated/prisma/enums";
import {
  BookingUpdateInput,
  TechnicianProfileWhereInput,
} from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  TechnicianQuery,
  UpdateAvailabilitySlots,
  UpdateBookingStatus,
  UpdateTechnicianProfile,
} from "./technician.validation";
import httpStatus from "http-status";

const getTechnicianOrThrow = async (technicianId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId: technicianId },
  });

  if (!technician) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician user not found!");
  }

  return technician;
};

const getAllTechniciansFromDB = async (query: TechnicianQuery) => {
  const {
    searchTerm,
    minRating,
    experienceYears,
    minHourlyRate,
    maxHourlyRate,
    serviceAreas,
    weekendDays,
    limit,
  } = query;

  const where: TechnicianProfileWhereInput = {};

  const andConditions: TechnicianProfileWhereInput[] = [];
  const searchConditions: TechnicianProfileWhereInput[] = [];

  if (searchTerm) {
    searchConditions.push({
      bio: { contains: searchTerm, mode: "insensitive" },
    });
    andConditions.push({ OR: searchConditions });
  }

  if (serviceAreas) {
    andConditions.push({ serviceAreas: { hasSome: serviceAreas } });
  }

  if (minHourlyRate || maxHourlyRate) {
    if (minHourlyRate) {
      andConditions.push({ hourlyRate: { gte: minHourlyRate } });
    }

    if (maxHourlyRate) {
      andConditions.push({ hourlyRate: { lte: maxHourlyRate } });
    }
  }

  if (experienceYears) {
    andConditions.push({ experienceYears: { gte: experienceYears } });
  }

  if (weekendDays) {
    andConditions.push({ availability: { weekendDays } });
  }

  if (minRating) {
    andConditions.push({ reviews: { some: { givenStars: minRating } } });
  }

  if (andConditions.length) {
    where.AND = andConditions;
  }

  const technicians = await prisma.technicianProfile.findMany({
    where,
    include: {
      availability: {
        select: { startTime: true, endTime: true, weekendDays: true },
      },
      technicianServices: { select: { service: { select: { name: true } } } },
      user: { select: { name: true } },
      reviews: { select: { givenStars: true } },
      _count: { select: { reviews: true } },
    },
    ...(limit && { take: limit }),
  });

  return technicians;
};

const getSingleTechnicianByID = async (technicianId: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: { id: technicianId },
    include: {
      _count: { select: { reviews: true } },
      reviews: { omit: { technicianId: true, id: true } },
      availability: {
        select: { weekendDays: true, startTime: true, endTime: true },
      },
    },
  });

  return technician;
};

const updateTechnicianProfileByTechnicianId = async (
  userId: string,
  payload: UpdateTechnicianProfile,
) => {
  const technician = await getTechnicianOrThrow(userId);

  const updateTechnicianProfile = await prisma.technicianProfile.update({
    where: { id: technician.id, userId },
    data: { ...payload },
  });

  return updateTechnicianProfile;
};

const updateAvailabilitySlotsByTechnicianId = async (
  userId: string,
  payload: UpdateAvailabilitySlots,
) => {
  const technician = await getTechnicianOrThrow(userId);

  const updateAvailability = await prisma.availability.update({
    where: {
      technicianId: technician.id,
    },
    data: { ...payload },
  });

  return updateAvailability;
};

const getTechnicianBookingsByTechnicianId = async (userId: string) => {
  const technician = await getTechnicianOrThrow(userId);

  const bookings = await prisma.booking.findMany({
    where: { technicianId: technician.id },
  });

  return bookings;
};

const updateBookingStatusByBookingId = async (
  userId: string,
  bookingId: string,
  payload: UpdateBookingStatus,
) => {
  const technician = await getTechnicianOrThrow(userId);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, technicianId: technician.id },
  });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }

  if (booking.status === payload.status) {
    return {
      message: "No changes were necessary. Status is already up-to-date",
      data: booking,
    };
  }

  if (booking.status === BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "The booking is completed and can't be updated",
    );
  }

  const updateData: BookingUpdateInput = { ...payload };

  if (payload.status === BookingStatus.ACCEPTED) {
    updateData.startedAt = new Date();
  }

  if (payload.status === BookingStatus.COMPLETED) {
    if (!booking.startedAt) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Booking cannot be completed before it has started!",
      );
    }

    const completedAt = new Date();
    const workedMinutes = Math.round(
      (completedAt.getTime() - booking.startedAt.getTime()) / 1000 / 60,
    );
    const totalPrice = (workedMinutes / 60) * Number(technician.hourlyRate);

    updateData.completedAt = completedAt;
    updateData.workedMinutes = workedMinutes;
    updateData.totalPrice = totalPrice;
  }

  const updateBooking = await prisma.booking.update({
    where: {
      id: bookingId,
      technicianId: technician.id,
    },
    data: updateData,
  });

  return {
    message: "Booking status updated successfully.",
    data: updateBooking,
  };
};

export const technicianService = {
  getAllTechniciansFromDB,
  getSingleTechnicianByID,
  updateTechnicianProfileByTechnicianId,
  updateAvailabilitySlotsByTechnicianId,
  getTechnicianBookingsByTechnicianId,
  updateBookingStatusByBookingId,
};
