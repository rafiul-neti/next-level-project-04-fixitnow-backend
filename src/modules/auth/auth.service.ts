import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ILoginPayload, IRegisterPayload } from "./auth.interface";
import httpStatus from "http-status";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";
import { JwtPayload } from "jsonwebtoken";

const registerUserIntoDB = async (payload: IRegisterPayload) => {
  const { name, email, password, phone, registeringAs } = payload;

  if (phone.length !== 11) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid phone number");
  }

  if (registeringAs === Role.TECHNICIAN) {
    if (!payload.hourlyRate) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Technicians must provide hourly rate",
      );
    }
  }

  const isUserExist = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (isUserExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A user already exists with this phone number or email!",
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role: registeringAs,
      ...(registeringAs === Role.TECHNICIAN && {
        technician: {
          create: {
            bio: payload.bio,
            profilePhoto: payload.profilePhoto,
            hourlyRate: payload.hourlyRate,
            experienceYears: payload.experienceYears,
            serviceAreas: payload.serviceAreas.split(", "),
            availability: {
              create: {
                weekendDays: payload.weekendDays,
                startTime: payload.startTime,
                endTime: payload.endTime,
              },
            },
          },
        },
      }),
    },
    omit: { password: true },
    ...(registeringAs === Role.TECHNICIAN && {
      include: {
        technician: {
          omit: { userId: true },
          include: { availability: { omit: { id: true, technicianId: true } } },
        },
      },
    }),
  });

  return createdUser;
};

const loginUserIntoApp = async (payload: ILoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Password!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_referesh_secret,
    config.jwt_refresh_expires_in,
  );

  return { accessToken, refreshToken, role: user.role };
};

const refreshToken = async (token: string) => {
  const verifyRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_referesh_secret,
  );

  if (!verifyRefreshToken.success) {
    throw new Error(verifyRefreshToken.error);
  }

  const { id } = verifyRefreshToken.data as JwtPayload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  const jwtPayload = {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  return { accessToken };
};

const getCurrentUserFromDB = async (userId: string, role: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
    ...(role === Role.TECHNICIAN && {
      include: { technician: { omit: { userId: true } } },
    }),
    ...(role === Role.CUSTOMER && {
      include: { addresses: { omit: { id: true, userId: true } } },
    }),
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User profile not found! Please log in.",
    );
  }

  return user;
};

export const authService = {
  registerUserIntoDB,
  loginUserIntoApp,
  refreshToken,
  getCurrentUserFromDB,
};
