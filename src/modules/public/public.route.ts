import { Router } from "express";
import { publicController } from "./public.controller";

const router = Router();

router.get(
  "/technicians-for-a-service/:serviceId",
  publicController.getTechniciansForAService,
);

export const publicRoutes = router;
