import httpStatus from "http-status";

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { ICreateOrganization, IGetOrganizationMembersQuery, IUpdateOrganization, IUpdateOrganizationMemberRole } from "./organization.interface";

const createOrganization = async (
  userId: string,
  payload: ICreateOrganization,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      emailVerified: true,
      deletedAt: true,
      status: true,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  if (user.deletedAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account has been deleted",
    );
  }

  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account has been blocked",
    );
  }

  if (!user.emailVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Please verify your email before creating an organization",
    );
  }

  const existingOrganization = await prisma.organization.findUnique({
  where: {
    slug: payload.slug,
  },
});

if (existingOrganization) {
  throw new AppError(
    httpStatus.CONFLICT,
    "Organization slug already exists",
  );
}

  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
      },
    });

    const member = await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role: "MANAGER",
      },
    });

    return {
      organization,
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

const getMyOrganizations = async (
  userId: string,
  query: {
    page?: string;
    limit?: string;
    search?: string;
  },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    organization: {
      deletedAt: null,
      ...(query.search && {
        OR: [
          {
            name: {
              contains: query.search,
              mode: "insensitive" as const,
            },
          },
          {
            slug: {
              contains: query.search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    },
  };

  const [memberships, total] = await Promise.all([
    prisma.organizationMember.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logo: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),

    prisma.organizationMember.count({
      where,
    }),
  ]);

  return {
    organizations: memberships,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getOrganizationById = async (
  userId: string,
  organizationId: string,
) => {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
      organization: {
        deletedAt: null,
      },
    },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!membership) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Organization not found or you are not a member",
    );
  }

  return membership;
};

const updateOrganization = async (
  userId: string,
  organizationId: string,
  payload: IUpdateOrganization,
) => {
  const membership = await prisma.organizationMember.findFirst({
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

  if (!membership) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update this organization",
    );
  }

  const organization = await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      ...payload,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return organization;
};

const getOrganizationMembers = async (
  userId: string,
  organizationId: string,
  query: IGetOrganizationMembersQuery,
) => {
const page = Number(query.page) || 1;
const limit = Number(query.limit) || 10;
const { search, role } = query;

  const organizationMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!organizationMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    ...(role && { role }),
    ...(search && {
      user: {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      },
    }),
  };

  const [members, total] = await prisma.$transaction([
    prisma.organizationMember.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        joinedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            emailVerified: true,
          },
        },
      },
    }),
    prisma.organizationMember.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: members,
  };

};

const updateOrganizationMemberRole = async (
  userId: string,
  organizationId: string,
  memberId: string,
  payload: IUpdateOrganizationMemberRole,
) => {
  const requester = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!requester) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (requester.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can change member roles",
    );
  }

  const targetMember = await prisma.organizationMember.findFirst({
    where: {
      id: memberId,
      organizationId,
    },
  });

  if (!targetMember) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Organization member not found",
    );
  }

  if (targetMember.role === payload.role) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Member is already a ${payload.role.toLowerCase()}`,
    );
  }

  if (targetMember.role === "MANAGER" && payload.role === "MEMBER") {
    const managerCount = await prisma.organizationMember.count({
      where: {
        organizationId,
        role: "MANAGER",
      },
    });

    if (managerCount <= 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Organization must have at least one manager",
      );
    }
  }

  const updatedMember = await prisma.organizationMember.update({
    where: {
      id: targetMember.id,
    },
    data: {
      role: payload.role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
        },
      },
    },
  });

  return updatedMember;
};

const removeOrganizationMember = async (
  userId: string,
  organizationId: string,
  memberId: string,
) => {
  const requester = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!requester) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  if (requester.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can remove members",
    );
  }

  const targetMember = await prisma.organizationMember.findFirst({
    where: {
      id: memberId,
      organizationId,
    },
  });

  if (!targetMember) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Organization member not found",
    );
  }

  if (targetMember.role === "MANAGER") {
    const managerCount = await prisma.organizationMember.count({
      where: {
        organizationId,
        role: "MANAGER",
      },
    });

    if (managerCount <= 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Organization must have at least one manager",
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.organizationMember.delete({
      where: {
        id: targetMember.id,
      },
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        action: "MEMBER_REMOVED",
        entityType: "MEMBER",
        entityId: targetMember.id,
        description: `Organization member removed`,
        metadata: {
          removedUserId: targetMember.userId,
          removedRole: targetMember.role,
        },
      },
    });
  });

  return null;
};

export const organizationService = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  getOrganizationMembers,
  updateOrganizationMemberRole,
  removeOrganizationMember,
};