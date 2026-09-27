import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import { IGetPaymentsQuery } from "./payment.interface";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPayment(
    req.user!.id,
    req.params.organizationId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment created successfully",
    data: result,
  });
});

const getPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getPayments(
    req.user!.id,
    req.params.organizationId as string,
    req.query as IGetPaymentsQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment history retrieved successfully",
    data: result,
  });
});

const verifyPayment = catchAsync(
  async (req: Request, res: Response) => {
    const { sessionId } = req.body;

    const userId = req.user!.id;
    const organizationId = req.params.organizationId as string;

    const result = await paymentService.verifyPayment(
      userId,
      organizationId,
      sessionId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Payment verified successfully",
      data: result,
    });
  },
);

export const paymentController = {
  createPayment,
  getPayments,
  verifyPayment
};