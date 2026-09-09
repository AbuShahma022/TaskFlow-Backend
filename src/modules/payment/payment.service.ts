import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import config from "../../config";
import { stripe } from "../../lib/stripe";



const createPayment = async (
  userId: string,
  organizationId: string,
) => {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (member.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can make subscription payments",
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      organizationId,
    },
  });

  if (!subscription) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Subscription not found",
    );
  }

  if (subscription.plan === "PRO" && subscription.status === "ACTIVE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Organization already has an active PRO subscription",
    );
  }

  // Get the Stripe Price configured for TaskFlow PRO
  const price = await stripe.prices.retrieve(
    config.stripe.proPriceId,
  );


  if (!price.active) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "TaskFlow PRO price is not active",
    );
  }

  if (!price.unit_amount || !price.currency) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid Stripe PRO price configuration",
    );
  }

  const payment = await prisma.payment.create({
    data: {
      organizationId,
      userId,
      amount: price.unit_amount / 100,
      currency: price.currency.toUpperCase(),
      status: "PENDING",
      provider: "STRIPE",
    },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: config.stripe.proPriceId,
        quantity: 1,
      },
    ],
    success_url: `${config.appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.appUrl}/payment/cancel`,
    metadata: {
      paymentId: payment.id,
      organizationId,
      userId,
    },
    subscription_data: {
      metadata: {
        paymentId: payment.id,
        organizationId,
        userId,
      },
    },
  });

  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      stripeCheckoutSessionId: checkoutSession.id,
    },
  });

  return {
    paymentId: payment.id,
    checkoutUrl: checkoutSession.url,
  };
};
const getPayments = async (
  userId: string,
  organizationId: string,
  query: {
    page?: number;
    limit?: number;
    status?: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  },
) => {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (member.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can view payment history",
    );
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    ...(query.status && {
      status: query.status,
    }),
  };

  const [total, payments] = await prisma.$transaction([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    data: payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const paymentService = {
  createPayment,
  getPayments
};