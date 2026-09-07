import httpStatus from "http-status";

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateOrganizationInvitation } from "./organizationInvitation.interface";


const createOrganizationInvitation = async (
  userId: string,
  organizationId: string,
  payload: ICreateOrganizationInvitation,
) => {
  // 1. Check that the requester is a MANAGER
  const manager = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
      role: "MANAGER",
      organization: {
        deletedAt: null,
      },
    },
    select: {
      id: true,
    },
  });

  if (!manager) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to invite members",
    );
  }

  // 2. Check that the invited user already has an account
  const invitedUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      deletedAt: true,
      status: true,
    },
  });

  if (!invitedUser || invitedUser.deletedAt) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No active user found with this email",
    );
  }

  if (!invitedUser.emailVerified) {
  throw new AppError(
    httpStatus.FORBIDDEN,
    "This user's email is not verified",
  );
}

  if (invitedUser.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This user account is blocked",
    );
  }

  // 3. Don't invite an existing organization member
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: invitedUser.id,
      },
    },
  });

  if (existingMember) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User is already a member of this organization",
    );
  }

  // 4. Don't create another pending invitation
  const existingInvitation =
    await prisma.organizationInvitation.findFirst({
      where: {
        organizationId,
        invitedUserId: invitedUser.id,
        status: "PENDING",
      },
    });

  if (existingInvitation) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A pending invitation already exists for this user",
    );
  }

  // 5. Create the invitation
  const invitation = await prisma.organizationInvitation.create({
    data: {
      organizationId,
      invitedUserId: invitedUser.id,
      invitedById: userId,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      invitedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return invitation;
};

export const organizationInvitationService = {
  createOrganizationInvitation,
};