import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { taskService } from "./task.service";
import { ICreateTask, IGetTasksQuery } from "./task.interface";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.createTask(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.body as ICreateTask,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Task created successfully",
    data: result,
  });
});

const getTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.getTasks(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.query as IGetTasksQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks retrieved successfully",
    data: result,
  });
});

export const taskController = {
  createTask,
  getTasks
};