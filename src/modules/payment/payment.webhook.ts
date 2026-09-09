import { Request, Response } from "express";
import httpStatus from "http-status";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import AppError from "../../utils/AppError";
import { ActivityAction, ActivityEntityType } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";



const handleStripeWebhook =  async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature || Array.isArray(signature)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing Stripe webhook signature",
    );
  }

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    config.stripe.webhookSecret,
  );
try {

    
if (event.type === "checkout.session.completed") {
     
  const session = event.data.object ;

  const paymentId = session.metadata?.paymentId;
  const organizationId = session.metadata?.organizationId;
  const userId = session.metadata?.userId;

  if (!paymentId || !organizationId || !userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing payment metadata",
    );
  }

  if (session.payment_status === "paid") {
      
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

      if (!payment) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "Payment not found",
        );
      }

      // Webhooks can be delivered more than once.
      if (payment.status === "PAID") {
        return;
      }

      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "PAID",
          transactionId: session.id,
          stripeCheckoutSessionId: session.id,
        },
      });

      await tx.subscription.update({
        where: {
          organizationId,
        },
        data: {
          plan: "PRO",
          status: "ACTIVE",
          stripeSubscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : null,
        },
      });

      await tx.activityLog.create({
        data: {
          organizationId,
          userId,
          action: ActivityAction.PAYMENT_COMPLETED,
          entityType: ActivityEntityType.PAYMENT,
          entityId: payment.id,
          description: "PRO subscription payment completed",
        },
      });

      await tx.activityLog.create({
        data: {
          organizationId,
          userId,
          action: ActivityAction.SUBSCRIPTION_CHANGED,
          entityType: ActivityEntityType.SUBSCRIPTION,
          entityId: organizationId,
          description: "Organization subscription upgraded to PRO",
        },
      });
    },

      {
    maxWait: 10000,
    timeout: 15000,
  },

);
  }
  
}

    
} catch (error:any) {
      console.error("Stripe webhook processing failed:", error);

  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Stripe webhook processing failed",
  });
    
}
if (event.type === "invoice.payment_failed") {
  const invoice = event.data.object;

  const subscriptionId =
    invoice.parent?.type === "subscription_details"
      ? typeof invoice.parent.subscription_details?.subscription === "string"
        ? invoice.parent.subscription_details.subscription
        : null
      : null;

  if (subscriptionId) {
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscriptionId,
      },
      data: {
        status: "EXPIRED",
      },
    });
  }
}

if (event.type === "customer.subscription.updated") {
  const subscription = event.data.object;

  const organizationId = subscription.metadata?.organizationId;

  if (organizationId) {
    await prisma.subscription.updateMany({
      where: {
        organizationId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        status:
          subscription.status === "active"
            ? "ACTIVE"
            : "EXPIRED",
        currentPeriodStart: subscription.items.data[0]?.current_period_start
          ? new Date(subscription.items.data[0].current_period_start * 1000)
          : null,
        currentPeriodEnd: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null,
      },
    });
  }
}

if (event.type === "customer.subscription.deleted") {
  const subscription = event.data.object;

  await prisma.subscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      plan: "FREE",
      status: "EXPIRED",
      currentPeriodStart: null,
      currentPeriodEnd: null,
    },
  });
}

  res.status(httpStatus.OK).json({
    received: true,
  });
};

export default handleStripeWebhook;