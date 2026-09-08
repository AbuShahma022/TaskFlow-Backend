import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { IAddProjectMember, ICreateProject, IGetProjectMembersQuery, IGetProjectsQuery, IUpdateProject } from "./project.interface";

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

const updateProject = async (
  userId: string,
  organizationId: string,
  projectId: string,
  payload: IUpdateProject,
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
      "Only organization managers can update projects",
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const updatedProject = await prisma.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: {
        id: projectId,
      },
      data: payload,
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        action: "PROJECT_UPDATED",
        entityType: "PROJECT",
        entityId: projectId,
        description: `Project "${updated.name}" was updated`,
        metadata: {
          projectId,
          projectName: updated.name,
        },
      },
    });

    return updated;
  });

  return updatedProject;
};

const archiveProject = async (
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

  if (organizationMember.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can archive projects",
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  if (project.status === "ARCHIVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Project is already archived",
    );
  }

  const archivedProject = await prisma.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        status: "ARCHIVED",
      },
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        action: "PROJECT_ARCHIVED",
        entityType: "PROJECT",
        entityId: projectId,
        description: `Project "${updated.name}" was archived`,
        metadata: {
          projectId,
          projectName: updated.name,
        },
      },
    });

    return updated;
  });

  return archivedProject;
};

const addProjectMember = async (
  userId: string,
  organizationId: string,
  projectId: string,
  payload: IAddProjectMember,
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
      "Only organization managers can add project members",
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  if (project.status === "ARCHIVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot add members to an archived project",
    );
  }

  const targetOrganizationMember =
    await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: payload.userId,
      },
    });

  if (!targetOrganizationMember) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User must be a member of this organization",
    );
  }

  const existingProjectMember = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: payload.userId,
    },
  });

  if (existingProjectMember) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User is already a member of this project",
    );
  }

  const projectMember = await prisma.projectMember.create({
    data: {
      projectId,
      userId: payload.userId,
    },
  });

  return projectMember;
};

const getProjectMembers = async (
  userId: string,
  organizationId: string,
  projectId: string,
  query: IGetProjectMembersQuery,
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
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {
    projectId,
    ...(query.search && {
      user: {
        OR: [
          {
            name: {
              contains: query.search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: query.search,
              mode: "insensitive" as const,
            },
          },
        ],
      },
    }),
  };

  const [total, members] = await prisma.$transaction([
    prisma.projectMember.count({ where }),
    prisma.projectMember.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        joinedAt: "asc",
      },
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
    }),
  ]);

  return {
    data: members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const removeProjectMember = async (
  userId: string,
  organizationId: string,
  projectId: string,
  memberId: string,
) => {
  const organizationMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!organizationMember || organizationMember!.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can remove project members",
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const projectMember = await prisma.projectMember.findFirst({
    where: {
      id: memberId,
      projectId,
    },
  });

  if (!projectMember) {
    throw new AppError(httpStatus.NOT_FOUND, "Project member not found");
  }

  await prisma.projectMember.delete({
    where: {
      id: memberId,
    },
  });

  return null;
};

export const projectService = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
  addProjectMember,
  getProjectMembers,
  removeProjectMember,
};