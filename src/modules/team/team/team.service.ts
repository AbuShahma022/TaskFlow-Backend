import { prisma } from "../../../lib/prisma";
import AppError from "../../../utils/AppError";
import { ICreateTeam, IGetTeamsQuery, IUpdateTeam } from "../team.interface";
import httpStatus from "http-status";


const createTeam = async (
  userId: string,
  organizationId: string,
  payload: ICreateTeam,
) => {
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

  if (organizationMember.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can create teams",
    );
  }

 const team = await prisma.$transaction(async (tx) => {
  const createdTeam = await tx.team.create({
    data: {
      organizationId,
      name: payload.name,
      description: payload.description,
    },
  });

  await tx.activityLog.create({
    data: {
      organizationId,
      userId,
      action: "TEAM_CREATED",
      entityType: "TEAM",
      entityId: createdTeam.id,
      description: `Team "${createdTeam.name}" was created`,
      metadata: {
        teamId: createdTeam.id,
        teamName: createdTeam.name,
      },
    },
  });

  return createdTeam;
});

  return team;
};

const getTeams = async (
  userId: string,
  organizationId: string,
  query: IGetTeamsQuery,
) => {
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

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const { search } = query;

  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    deletedAt: null,
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [teams, total] = await prisma.$transaction([
    prisma.team.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    }),
    prisma.team.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: teams,
  };
};

const getTeam = async (
  userId: string,
  organizationId: string,
  teamId: string,
) => {
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

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      organizationId,
      deletedAt: null,
    },
    include: {
      members: {
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
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!team) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Team not found",
    );
  }

  return team;
};


const updateTeam = async (
  userId: string,
  organizationId: string,
  teamId: string,
  payload: IUpdateTeam,
) => {
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

  if (organizationMember.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can update teams",
    );
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  const updatedTeam = await prisma.team.update({
    where: {
      id: teamId,
    },
    data: payload,
  });

  return updatedTeam;
};

const deleteTeam = async (
  userId: string,
  organizationId: string,
  teamId: string,
) => {
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

  if (organizationMember.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can delete teams",
    );
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
  }

  const deletedTeam = await prisma.team.update({
    where: {
      id: teamId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return deletedTeam;
};

export const teamService = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
};