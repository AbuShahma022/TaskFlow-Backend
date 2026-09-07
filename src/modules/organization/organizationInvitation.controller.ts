import type { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { organizationInvitationService } from "./organizationInvitation.service";

const createOrganizationInvitation = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await organizationInvitationService.createOrganizationInvitation(
        req.user!.id,
        req.params.id as string,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Organization invitation created successfully",
      data: result,
    });
  },
);

const respondToOrganizationInvitation = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await organizationInvitationService.respondToOrganizationInvitation(
        req.user!.id,
        req.params.id as string,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        req.body.status === "ACCEPTED"
          ? "Organization invitation accepted successfully"
          : "Organization invitation rejected successfully",
      data: result,
    });
  },
);

const getMyInvitations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await organizationInvitationService.getMyInvitations(
        req.user!.id,
        req.query as {
          page?: string;
          limit?: string;
          status?: string;
        },
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invitations retrieved successfully",
      data: result.invitations,
      meta: result.meta,
    });
  },
);

const getOrganizationInvitations = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await organizationInvitationService.getOrganizationInvitations(
        req.user!.id,
        req.params.id as string,
        req.query as {
          page?: string;
          limit?: string;
          status?: string;
        },
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization invitations retrieved successfully",
      data: result.invitations,
      meta: result.meta,
    });
  },
);

export const organizationInvitationController = {
  createOrganizationInvitation,
  respondToOrganizationInvitation,
  getMyInvitations,
  getOrganizationInvitations,
};