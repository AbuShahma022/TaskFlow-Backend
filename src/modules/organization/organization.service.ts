import httpStatus from "http-status";

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { ICreateOrganization, IUpdateOrganization } from "./organization.interface";

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

export const organizationService = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
};