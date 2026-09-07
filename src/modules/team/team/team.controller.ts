import { Request, Response } from "express";
import httpStatus from "http-status";
import { teamService } from "./team.service";
import { ICreateTeam, IGetTeamsQuery } from "../team.interface";
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

export const teamController = {
  createTeam,
  getTeams,
  getTeam,
};