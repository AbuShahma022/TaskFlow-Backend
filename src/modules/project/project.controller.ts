import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ICreateProject, IGetProjectsQuery } from "./project.interface";
import { projectService } from "./project.service";

const createProject = catchAsync(async (req: Request, res: Response) => {
  const result = await projectService.createProject(
    req.user!.id,
    req.params.organizationId as string,
    req.body as ICreateProject,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Project created successfully",
    data: result,
  });
});

const getProjects = catchAsync(async (req: Request, res: Response) => {
  const result = await projectService.getProjects(
    req.user!.id,
    req.params.organizationId as string,
    req.query as IGetProjectsQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Projects retrieved successfully",
    data: result,
  });
});

const getProject = catchAsync(async (req: Request, res: Response) => {
  const result = await projectService.getProject(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project retrieved successfully",
    data: result,
  });
});

export const projectController = {
  createProject,
  getProjects,
  getProject,
};