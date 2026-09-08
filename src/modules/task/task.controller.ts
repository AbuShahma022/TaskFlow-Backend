import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { taskService } from "./task.service";
import { IAssignTask, ICreateTask, IGetTasksQuery, IUpdateTask, IUpdateTaskStatus } from "./task.interface";

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

const getTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.getTask(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task retrieved successfully",
    data: result,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.updateTask(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.body as IUpdateTask,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated successfully",
    data: result,
  });
});

const updateTaskStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.updateTaskStatus(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.body as IUpdateTaskStatus,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task status updated successfully",
    data: result,
  });
});

const assignTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.assignTask(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.body as IAssignTask,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task assignment updated successfully",
    data: result,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.deleteTask(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task deleted successfully",
    data: result,
  });
});

export const taskController = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask
};