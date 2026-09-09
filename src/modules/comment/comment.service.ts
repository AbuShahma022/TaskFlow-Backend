import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateComment, IUpdateComment } from "./comment.interface";

const createComment = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  payload: ICreateComment,
) => {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      deletedAt: null,
      project: {
        id: projectId,
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (task.status === "DONE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot comment on a completed task",
    );
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId,
      content: payload.content,
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
  });

  return comment;
};

const getComments = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
) => {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      deletedAt: null,
      project: {
        id: projectId,
        organizationId,
        deletedAt: null,
      },
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const comments = await prisma.comment.findMany({
    where: {
      taskId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "asc",
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
  });

  return comments;
};

const updateComment = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  commentId: string,
  payload: IUpdateComment,
) => {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      taskId,
      deletedAt: null,
      task: {
        id: taskId,
        projectId,
        deletedAt: null,
        project: {
          id: projectId,
          organizationId,
          deletedAt: null,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

/*
   MEMBER can update only their own comment and
   MANAGER can update any comment.

*/
  if (member.role === "MEMBER" && comment.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own comments",
    );
  }

  const updatedComment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content: payload.content,
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
  });

  return updatedComment;
};

const deleteComment = async (
  userId: string,
  organizationId: string,
  projectId: string,
  taskId: string,
  commentId: string,
) => {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!member) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this organization",
    );
  }

  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      taskId,
      deletedAt: null,
      task: {
        id: taskId,
        projectId,
        deletedAt: null,
        project: {
          id: projectId,
          organizationId,
          deletedAt: null,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

/*
   MEMBER can delete only their own comment. and
   MANAGER can delete any comment.

*/
  if (member.role === "MEMBER" && comment.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own comments",
    );
  }

  const deletedComment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return deletedComment;
};

export const commentService = {
  createComment,
  getComments,
  updateComment,
  deleteComment
};