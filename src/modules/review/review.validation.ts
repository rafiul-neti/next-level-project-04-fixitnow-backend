import { z } from "zod";

export const createReviewSchema = z.object({
  content: z.string().optional(),
  givenStars: z.number().min(1).max(5),
});

export const bookingIdSchema = z.object({
  bookingId: z.uuid(),
});

export const reviewLimitSchema = z.object({
  limit: z.coerce.number().optional(),
});

export type CreateReviewPayload = z.infer<typeof createReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewLimitSchema>;
