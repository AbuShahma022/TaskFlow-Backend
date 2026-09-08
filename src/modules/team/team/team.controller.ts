import { Request, Response } from "express";
import httpStatus from "http-status";
import { teamService } from "./team.service";
import { IAddTeamMember, ICreateTeam, IGetTeamsQuery, IUpdateTeam } from "../team.interface";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";


const createTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.createTeam(
    req.user!.id,
    req.params.organizationId as string,
    req.body as ICreateTeam,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Team created successfully",
    data: result,
  });
});

const getTeams = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.getTeams(
    req.user!.id,
    req.params.organizationId as string,
    req.query as IGetTeamsQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teams retrieved successfully",
    data: result,
  });
});

const getTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.getTeam(
    req.user!.id,
    req.params.organizationId as string,
    req.params.teamId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team retrieved successfully",
    data: result,
  });
});

const updateTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.updateTeam(
    req.user!.id,
    req.params.organizationId as string,
    req.params.teamId as string,
    req.body as IUpdateTeam,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team updated successfully",
    data: result,
  });
});

const deleteTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.deleteTeam(
    req.user!.id,
    req.params.organizationId as string,
    req.params.teamId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team deleted successfully",
    data: result,
  });
});

const addTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.addTeamMember(
    req.user!.id,
    req.params.organizationId as string,
    req.params.teamId as string,
    req.body as IAddTeamMember,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Team member added successfully",
    data: result,
  });
});

const getTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.getTeamMembers(
    req.user!.id,
    req.params.organizationId as string,
    req.params.teamId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team members retrieved successfully",
    data: result,
  });
});

const removeTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.removeTeamMember(
    req.user!.id,
    req.params.organizationId as string,
    req.params.teamId as string,
    req.params.memberId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team member removed successfully",
    data: result,
  });
});

export const teamController = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
};