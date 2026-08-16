import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import {
  handleCheckoutSessionCompleted,
  handleCheckoutSessionExpired,
  handlePaymentIntentFailed,
} from "./payment.utils";
import {
  PaymentProvider,
  PaymentStatus,
} from "../../../generated/prisma/enums";

const createCheckoutSession = async (customerId: string, bookingId: string) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: customerId },
    include: {
      service: { select: { name: true } },
      user: { select: { email: true } },
      payment: { select: { status: true } },
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }

  if (booking.payment?.status === PaymentStatus.PAID) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This booking has already been paid for.",
    );
  }

  if (booking.payment?.status === PaymentStatus.PENDING) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A payment is already in progress for this booking. Please complete or wait for it to expire.",
    );
  }

  const session = await stripe.checkout.sessions.create(
    {
      line_items: [
        {
          price_data: {
            currency: "bdt",
            unit_amount: Math.round(Number(booking.totalPrice) * 100),
            product_data: { name: booking.service.name },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.user.email,
      metadata: { userId: booking.userId, bookingId: booking.id },
      payment_intent_data: { metadata: { bookingId: booking.id } },
      success_url: `${config.app_url}/dashboard/customer/my-bookings/${booking.id}/checkout?success=true`,
      cancel_url: `${config.app_url}/dashboard/customer/my-bookings/${booking.id}/checkout?success=false`,
    },
    { idempotencyKey: `payment-session-${booking.id}` },
  );

  const payment = await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId: booking.id,
      userId: booking.userId,
      stripeCheckoutSessionId: session.id,
      amount: Number(booking.totalPrice),
      method: "card",
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
    },
    update: {
      stripeCheckoutSessionId: session.id,
    },
  });

  return { paymentURL: session.url, payment };
};

const confirmPaymentWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_wehhook_secret,
    );
  } catch (error: any) {
    throw new AppError(
      400,
      `Webhook signature verification failed: ${error.message}`,
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      await handleCheckoutSessionExpired(session);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await handlePaymentIntentFailed(paymentIntent);
      break;
    }

    default:
      console.log(
        `[stripe webhook] Unhandled event type: ${event.type} (id: ${event.id})`,
      );
      break;
  }
};

const getUserPaymentsFromDB = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      booking: {
        select: {
          service: { select: { name: true } },
          technician: { select: { user: { select: { name: true } } } },
        },
      },
    },
  });

  return payments;
};

const getPaymentDetailsByID = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        select: {
          service: {
            select: {
              name: true,
              category: { select: { name: true } },
              description: true,
            },
          },
          technician: {
            select: {
              user: { select: { name: true } },
              bio: true,
              experienceYears: true,
              profilePhoto: true,
              reviews: { select: { givenStars: true } },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment details is not available!",
    );
  }

  const { booking, ...rest } = payment;

  return {
    ...rest,
    bookingDetails: {
      serviceName: booking.service.name,
      serviceCategory: booking.service.category.name,
      serviceDescription: booking.service.description,
      technicianName: booking.technician.user.name,
      technicianBio: booking.technician.bio,
      technicianExperienceYears: booking.technician.experienceYears,
      technicianPhoto: booking.technician.profilePhoto,
      technicianRating:
        booking.technician.reviews.reduce(
          (acc, curr) => acc + curr.givenStars,
          0,
        ) / booking.technician.reviews.length,
    },
  };
};

export const paymentService = {
  createCheckoutSession,
  confirmPaymentWebhook,
  getUserPaymentsFromDB,
  getPaymentDetailsByID,
};
