import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IAddProjectMember, ICreateProject, IGetProjectMembersQuery, IGetProjectsQuery, IUpdateProject } from "./project.interface";
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

const updateProject = catchAsync(async (req: Request, res: Response) => {
  const result = await projectService.updateProject(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.body as IUpdateProject,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project updated successfully",
    data: result,
  });
});

const archiveProject = catchAsync(async (req: Request, res: Response) => {
  const result = await projectService.archiveProject(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project archived successfully",
    data: result,
  });
});

const addProjectMember = catchAsync(async (req: Request, res: Response) => {
  const result = await projectService.addProjectMember(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.body as IAddProjectMember,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Project member added successfully",
    data: result,
  });
});

const getProjectMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await projectService.getProjectMembers(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.query as IGetProjectMembersQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project members retrieved successfully",
    data: result,
  });
});

const removeProjectMember = catchAsync(async (req: Request, res: Response) => {
  await projectService.removeProjectMember(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.memberId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project member removed successfully",
    data: null,
  });
});

export const projectController = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
  addProjectMember,
  getProjectMembers,
  removeProjectMember,
};