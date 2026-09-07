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

  // 5. Create invitation + activity log atomically
  const result = await prisma.$transaction(
    async (tx) => {
      const invitation =
        await tx.organizationInvitation.create({
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

      await tx.activityLog.create({
        data: {
          organizationId,
          userId,
          action: "MEMBER_INVITED",
          entityType: "MEMBER",
          entityId: invitedUser.id,
          description: `Invitation sent to ${invitedUser.email}`,
          metadata: {
            invitationId: invitation.id,
          },
        },
      });

      return invitation;
    },
    {
      maxWait: 10000,
      timeout: 10000,
    },
  );

  return result;
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
  const result = await prisma.$transaction(
    async (tx) => {
      const updatedInvitation =
        await tx.organizationInvitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            status: "REJECTED",
            respondedAt: new Date(),
          },
        });

      await tx.activityLog.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          action: "INVITATION_REJECTED",
          entityType: "MEMBER",
          entityId: invitation.invitedUserId,
          description: "Organization invitation rejected",
          metadata: {
            invitationId: invitation.id,
          },
        },
      });

      return updatedInvitation;
    },
    {
      maxWait: 10000,
      timeout: 10000,
    },
  );

  return result;
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

        await tx.activityLog.create({
          data: {
            organizationId: invitation.organizationId,
            userId,
            action: "MEMBER_ADDED",
            entityType: "MEMBER",
            entityId: member.id,
            description: "Organization invitation accepted and member added",
            metadata: {
              invitationId: invitation.id,
            },
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

const getMyInvitations = async (
  userId: string,
  query: {
    page?: string;
    limit?: string;
    status?: string;
  },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {
    invitedUserId: userId,
    ...(query.status && {
      status: query.status as
        | "PENDING"
        | "ACCEPTED"
        | "REJECTED"
        | "CANCELLED",
    }),
  };

  const [invitations, total] = await Promise.all([
    prisma.organizationInvitation.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        respondedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    }),

    prisma.organizationInvitation.count({
      where,
    }),
  ]);

  return {
    invitations,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getOrganizationInvitations = async (
  userId: string,
  organizationId: string,
  query: {
    page?: string;
    limit?: string;
    status?: string;
  },
) => {
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
      "You do not have permission to view organization invitations",
    );
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    ...(query.status && {
      status: query.status as
        | "PENDING"
        | "ACCEPTED"
        | "REJECTED"
        | "CANCELLED",
    }),
  };

  const [invitations, total] = await Promise.all([
    prisma.organizationInvitation.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        respondedAt: true,
        invitedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.organizationInvitation.count({
      where,
    }),
  ]);

  return {
    invitations,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const cancelOrganizationInvitation = async (
  userId: string,
  invitationId: string,
) => {
  const invitation = await prisma.organizationInvitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  if (!invitation) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Organization invitation not found",
    );
  }

  const manager = await prisma.organizationMember.findFirst({
    where: {
      organizationId: invitation.organizationId,
      userId,
      role: "MANAGER",
    },
  });

  if (!manager) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can cancel invitations",
    );
  }

  if (invitation.status !== "PENDING") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only pending invitations can be cancelled",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.organizationInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    await tx.activityLog.create({
      data: {
        organizationId: invitation.organizationId,
        userId,
        action: "INVITATION_CANCELLED",
        entityType: "MEMBER",
        entityId: invitation.invitedUserId,
        description: "Organization invitation cancelled",
        metadata: {
          invitationId: invitation.id,
          invitedUserId: invitation.invitedUserId,
        },
      },
    });
  });

  return null;
};

export const organizationInvitationService = {
  createOrganizationInvitation,
    respondToOrganizationInvitation,
    getMyInvitations,
    getOrganizationInvitations,
    cancelOrganizationInvitation
};