import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { subtaskService } from "./subtask.service";
import { ICreateSubtask, IUpdateSubtask, IUpdateSubtaskStatus } from "./subtask.interface";

const createSubtask = catchAsync(async (req: Request, res: Response) => {
  const result = await subtaskService.createSubtask(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.body as ICreateSubtask,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subtask created successfully",
    data: result,
  });
});

const getSubtasks = catchAsync(async (req: Request, res: Response) => {
  const result = await subtaskService.getSubtasks(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subtasks retrieved successfully",
    data: result,
  });
});

const updateSubtask = catchAsync(async (req: Request, res: Response) => {
  const result = await subtaskService.updateSubtask(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.params.subtaskId as string,
    req.body as IUpdateSubtask,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subtask updated successfully",
    data: result,
  });
});

const updateSubtaskStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await subtaskService.updateSubtaskStatus(
      req.user!.id,
      req.params.organizationId as string,
      req.params.projectId as string,
      req.params.taskId as string,
      req.params.subtaskId as string,
      req.body as IUpdateSubtaskStatus,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Subtask status updated successfully",
      data: result,
    });
  },
);

const deleteSubtask = catchAsync(async (req: Request, res: Response) => {
  const result = await subtaskService.deleteSubtask(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.params.subtaskId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subtask deleted successfully",
    data: result,
  });
});

export const subtaskController = {
  createSubtask,
  getSubtasks,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask
};