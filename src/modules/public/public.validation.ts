import { z } from "zod";

export const serviceIdSchema = z.object({
  serviceId: z.uuid(),
});

export type ServiceIdType = z.infer<typeof serviceIdSchema>;
