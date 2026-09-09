import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { activityLogService } from "./activityLog.service";
import { IGetActivityLogsQuery } from "./activityLog.interface";

const getActivityLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await activityLogService.getActivityLogs(
    req.user!.id,
    req.params.organizationId as string,
    req.query as IGetActivityLogsQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Activity logs retrieved successfully",
    data: result,
  });
});

export const activityLogController = {
  getActivityLogs,
};