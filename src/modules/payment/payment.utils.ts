import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
} from "../../../generated/prisma/enums";

export const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const bookingId = session.metadata?.bookingId;
  const userId = session.metadata?.userId!;

  if (session.payment_status !== "paid") return;

  if (!bookingId) {
    console.error(
      "[stripe webhook] checkout.session.completed missing bookingId in metadata",
      {
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        customerEmail: session.customer_email,
      },
    );
    return;
  }

  await prisma.payment.upsert({
    where: { bookingId },
    update: {
      status: PaymentStatus.PAID,
      stripePaymentIntentId: session.payment_intent as string,
      paidAt: new Date(),
    },
    create: {
      bookingId,
      userId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      amount: (session.amount_total ?? 0) / 100,
      method: "card",
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });
};

export const handleCheckoutSessionExpired = async (
  session: Stripe.Checkout.Session,
) => {
  const bookingId = session.metadata?.bookingId;

  if (session.payment_status !== "paid") return;

  if (!bookingId) {
    console.error(
      "[stripe webhook] checkout.session.expired missing bookingId in metadata",
      {
        sessionId: session.id,
      },
    );
    return;
  }

  await prisma.payment.update({
    where: { bookingId },
    data: { status: PaymentStatus.FAILED },
  });
};

export const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    console.error(
      "[stripe webhook] checkout.session.payment_failed missing bookingId in metadata",
      {
        paymentIntentId: paymentIntent.id,
      },
    );
    return;
  }

  await prisma.payment.update({
    where: { bookingId },
    data: {
      status: PaymentStatus.FAILED,
      stripePaymentIntentId: paymentIntent.id,
      failureReason:
        paymentIntent.last_payment_error?.message ?? "Unknown failure reason!",
    },
  });
};
