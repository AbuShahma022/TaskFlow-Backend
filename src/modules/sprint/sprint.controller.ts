import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { sprintService } from "./sprint.service";
import { ICreateSprint, IGetSprintsQuery, IUpdateSprint } from "./sprint.interface";

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

const getSprint = catchAsync(async (req: Request, res: Response) => {
  const result = await sprintService.getSprint(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.sprintId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint retrieved successfully",
    data: result,
  });
});


const updateSprint = catchAsync(async (req: Request, res: Response) => {
  const result = await sprintService.updateSprint(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.sprintId as string,
    req.body as IUpdateSprint,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint updated successfully",
    data: result,
  });
});

const startSprint = catchAsync(async (req: Request, res: Response) => {
  const result = await sprintService.startSprint(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.sprintId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint started successfully",
    data: result,
  });
});

const completeSprint = catchAsync(async (req: Request, res: Response) => {
  const result = await sprintService.completeSprint(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.sprintId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint completed successfully",
    data: result,
  });
});

const archiveSprint = catchAsync(async (req: Request, res: Response) => {
  const result = await sprintService.archiveSprint(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.sprintId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint archived successfully",
    data: result,
  });
});

export const sprintController = {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  startSprint,
  completeSprint,
  archiveSprint,
};