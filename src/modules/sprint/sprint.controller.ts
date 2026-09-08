import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { sprintService } from "./sprint.service";
import { ICreateSprint, IGetSprintsQuery } from "./sprint.interface";

const createSprint = catchAsync(async (req: Request, res: Response) => {
  const result = await sprintService.createSprint(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.body as ICreateSprint,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Sprint created successfully",
    data: result,
  });
});

const getSprints = catchAsync(async (req: Request, res: Response) => {
  const result = await sprintService.getSprints(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.query as IGetSprintsQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprints retrieved successfully",
    data: result,
  });
});

export const sprintController = {
  createSprint,
  getSprints,
};