import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { subscriptionService } from "./subscription.service";
import { IUpdateSubscriptionPlan } from "./subscription.interface";

const getSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getSubscription(
    req.user!.id,
    req.params.organizationId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

const updateSubscriptionPlan = catchAsync(
  async (req: Request, res: Response) => {
    const result = await subscriptionService.updateSubscriptionPlan(
      req.user!.id,
      req.params.organizationId as string,
      req.body as IUpdateSubscriptionPlan,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Subscription plan updated successfully",
      data: result,
    });
  },
);

export const subscriptionController = {
  getSubscription,
  updateSubscriptionPlan
};