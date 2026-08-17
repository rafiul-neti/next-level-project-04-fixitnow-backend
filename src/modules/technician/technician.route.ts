import { Router } from "express";
import { technicianController } from "./technician.controller";
import validateQuery from "../../middleware/validateQuery";
import {
  getTechnicianQuerySchema,
  updateAvailabilitySlotsSchema,
  bookingStatusSchema,
  updateTechnicianProfileSchema,
} from "./technician.validation";
import authGuard from "../../middleware/authGuard";
import { Role } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";

const router = Router();

router.get(
  "/",
  validateQuery(getTechnicianQuerySchema),
  technicianController.getAllTechnicians,
);

router.get("/:id", technicianController.getSingleTechnician);

router.get(
  "/:technicianId/dashboard",
  authGuard(Role.TECHNICIAN),
  technicianController.getTechnicianDetails,
);

router.get(
  "/technician/bookings",
  authGuard(Role.TECHNICIAN),
  validateQuery(getTechnicianQuerySchema),
  technicianController.getTechnicianBookings,
);

router.get(
  "/:technicianId/services",
  authGuard(Role.TECHNICIAN),
  technicianController.getTechnicianServices,
);

router.put(
  "/profile",
  authGuard(Role.TECHNICIAN),
  validateRequest(updateTechnicianProfileSchema),
  technicianController.updateTechnicianProfile,
);

router.put(
  "/availability",
  authGuard(Role.TECHNICIAN),
  validateRequest(updateAvailabilitySlotsSchema),
  technicianController.updateAvailabilitySlots,
);

router.patch(
  "/bookings/:bookingId",
  validateRequest(bookingStatusSchema),
  authGuard(Role.TECHNICIAN),
  technicianController.updateBookingStatus,
);

export const technicianRoutes = router;
