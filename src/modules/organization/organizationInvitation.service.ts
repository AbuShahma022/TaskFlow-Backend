import httpStatus from "http-status";

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateOrganizationInvitation, IRespondToOrganizationInvitation } from "./organizationInvitation.interface";


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

  // 3. Prevent inviting an existing organization member
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

  // 4. Prevent creating another pending invitation
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


const respondToOrganizationInvitation = async (
  userId: string,
  invitationId: string,
  payload: IRespondToOrganizationInvitation,
) => {
  // 1. Find the invitation belonging to the current user
  const invitation = await prisma.organizationInvitation.findFirst({
    where: {
      id: invitationId,
      invitedUserId: userId,
      status: "PENDING",
    },
    select: {
      id: true,
      organizationId: true,
      invitedUserId: true,
      status: true,
    },
  });

  if (!invitation) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Pending invitation not found",
    );
  }

  // 2. If rejected,  update the invitation
  if (payload.status === "REJECTED") {
    return prisma.organizationInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: "REJECTED",
        respondedAt: new Date(),
      },
    });
  }

  // 3. Accept invitation and add user to organization atomically
  const result = await prisma.$transaction(
    async (tx) => {
      const member = await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: "MEMBER",
        },
      });

      const updatedInvitation =
        await tx.organizationInvitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
          },
        });

      return {
        invitation: updatedInvitation,
        member,
      };
    },
    {
      maxWait: 10000,
      timeout: 10000,
    },
  );

  return result;
};

export const organizationInvitationService = {
  createOrganizationInvitation,
    respondToOrganizationInvitation,
};