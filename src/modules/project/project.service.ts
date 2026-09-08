import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateProject, IGetProjectsQuery } from "./project.interface";

const createProject = async (
  userId: string,
  organizationId: string,
  payload: ICreateProject,
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
      "Only organization managers can create projects",
    );
  }

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
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
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: createdProject.id,
        description: `Project "${createdProject.name}" was created`,
        metadata: {
          projectId: createdProject.id,
          projectName: createdProject.name,
        },
      },
    });

    return createdProject;
  });

  return project;
};

const getProjects = async (
  userId: string,
  organizationId: string,
  query: IGetProjectsQuery,
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
  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    deletedAt: null,
    ...(query.status && {
      status: query.status,
    }),
    ...(query.search && {
      OR: [
        {
          name: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [total, projects] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
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
            tasks: true,
            sprints: true,
          },
        },
      },
    }),
  ]);

  return {
    data: projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


const getProject = async (
  userId: string,
  organizationId: string,
  projectId: string,
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

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
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
            },
          },
        },
      },
      sprints: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          members: true,
          tasks: true,
          sprints: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  return project;
};

export const projectService = {
  createProject,
  getProjects,
  getProject,
};