import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import findUserOrThrow from "../../utils/findUserOrThrow";
import { CreateCategory, UserStatusInput } from "./admin.validation";
import httpStatus from "http-status";

const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    omit: { password: true, updatedAt: true },
  });

  return users;
};

const getAllBookingsFromDB = async () => {
  const bookings = await prisma.booking.findMany({
    include: {
      address: {
        select: {
          address_line_1: true,
          address_line_2: true,
          city: true,
          postCode: true,
          region: true,
        },
      },
      payment: { select: { amount: true, failureReason: true, status: true } },
      service: {
        select: {
          name: true,
          category: { select: { name: true } },
          description: true,
        },
      },
      technician: { select: { user: { select: { name: true } } } },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  return bookings;
};

const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    include: {
      services: { select: { id: true, name: true, description: true } },
    },
  });

  return categories;
};

const getAdminDashboardStats = async () => {
  const [
    totalUsers,
    totalBookings,
    totalRevenue,
    averageRating,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: Role.ADMIN } } }),
    prisma.booking.count(),
    prisma.payment.aggregate({
      where: { amount: { not: undefined } },
      _sum: { amount: true },
    }),
    prisma.review.aggregate({
      where: { givenStars: { not: undefined } },
      _avg: { givenStars: true },
    }),
    prisma.booking.findMany({
      select: {
        user: { select: { name: true } },
        technician: { select: { user: { select: { name: true } } } },
        service: { select: { name: true } },
        id: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    stats: {
      totalUsers,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount,
      averageRating: averageRating._avg.givenStars,
    },
    recentBookings,
  };
};

const updateUserStatusByUserId = async (
  userId: string,
  payload: UserStatusInput,
) => {
  const user = await findUserOrThrow(userId);

  if (user.status === payload.status) {
    return {
      message: "No changes were necessary. Status is already up-to-date",
      data: user,
    };
  }

  const updateUser = await prisma.user.update({
    where: { id: userId },
    data: { ...payload },
    omit: { password: true },
  });

  return { message: "User's status updated successfully.", data: updateUser };
};

const createNewServiceCategoryIntoDB = async (payload: CreateCategory) => {
  const category = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (category) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A category with this name already exists.",
    );
  }

  const newCategory = await prisma.category.create({ data: { ...payload } });

  return newCategory;
};

export const adminService = {
  getAllUsersFromDB,
  getAdminDashboardStats,
  getAllBookingsFromDB,
  getAllCategoriesFromDB,
  updateUserStatusByUserId,
  createNewServiceCategoryIntoDB,
};
