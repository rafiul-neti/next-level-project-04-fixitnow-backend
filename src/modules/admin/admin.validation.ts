import { z } from "zod";
import { UserStatus } from "../../../generated/prisma/enums";

export const userStatusSchema = z.object({
  status: z.enum(UserStatus),
});

export const createCategorySchema = z.object({
  name: z.string(),
});

export const createServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const userIdSchema = z.object({
  userId: z.uuid(),
});

export const categoryIdSchema = z.object({
  categoryId: z.uuid(),
});

export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type CreateService = z.infer<typeof createServiceSchema>;
