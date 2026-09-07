import type { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { organizationService } from "./organization.service";

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await organizationService.createOrganization(
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

const getMyOrganizations = catchAsync(async (req, res) => {
  const result = await organizationService.getMyOrganizations(
    req.user!.id,
    req.query as {
      page?: string;
      limit?: string;
      search?: string;
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organizations retrieved successfully",
    data: result.organizations,
    meta: result.meta,
  });
});

const getOrganizationById = catchAsync(async (req, res) => {
  const result = await organizationService.getOrganizationById(
    req.user!.id,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization retrieved successfully",
    data: result,
  });
});

const updateOrganization = catchAsync(async (req, res) => {
  const result = await organizationService.updateOrganization(
    req.user!.id,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization updated successfully",
    data: result,
  });
});

export const organizationController = {
  createOrganization,
    getMyOrganizations,
    getOrganizationById,
    updateOrganization,
};