import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { addressRoutes } from "./modules/address/address.route";
import { servicesRoutes } from "./modules/service/services.route";
import { technicianRoutes } from "./modules/technician/technician.route";
import { categoryRoutes } from "./modules/category/category.route";
import { bookingRoutes } from "./modules/booking/booking.route";
import { reviewRoutes } from "./modules/review/review.route";
import { adminRoutes } from "./modules/admin/admin.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { notFound } from "./middleware/not-found";
import { publicRoutes } from "./modules/public/public.route";

const app: Application = express();

app.use(cors({ origin: config.app_url }));

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "This response is from the root route!" });
});

app.use(notFound);

app.use(globalErrorHandler);

export default app;
