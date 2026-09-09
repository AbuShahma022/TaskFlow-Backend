import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { IUpdateSubscriptionPlan } from "./subscription.interface";

const getSubscription = async (
  userId: string,
  organizationId: string,
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

  const subscription = await prisma.subscription.findUnique({
    where: {
      organizationId,
    },
  });

  if (!subscription) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Subscription not found",
    );
  }

  return subscription;
};


const getOrganizationSubscription = async (organizationId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      organizationId,
    },
  });

  if (!subscription) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Subscription not found",
    );
  }

  return subscription;
};

const checkProjectLimit = async (organizationId: string) => {
const subscription = await getOrganizationSubscription(organizationId);

  // PRO organizations have no project limit.
  if (subscription.plan === "PRO") {
    return true;
  }

  const projectCount = await prisma.project.count({
    where: {
      organizationId,
      deletedAt: null,
    },
  });

  const FREE_PROJECT_LIMIT = 2;

  if (projectCount >= FREE_PROJECT_LIMIT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Free plan project limit reached. Please upgrade to PRO",
    );
  }

  return true;
};

const checkTeamLimit = async (organizationId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      organizationId,
    },
  });

  if (!subscription) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Subscription not found",
    );
  }

  if (subscription.plan === "PRO") {
    return true;
  }

  const teamCount = await prisma.team.count({
    where: {
      organizationId,
      deletedAt: null,
    },
  });

  const FREE_TEAM_LIMIT = 2;

  if (teamCount >= FREE_TEAM_LIMIT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Free plan team limit reached. Please upgrade to PRO",
    );
  }

  return true;
};

const checkTaskLimit = async (organizationId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      organizationId,
    },
  });

  if (!subscription) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Subscription not found",
    );
  }

  if (subscription.plan === "PRO") {
    return true;
  }

  const taskCount = await prisma.task.count({
    where: {
      project: {
        organizationId,
      },
      deletedAt: null,
    },
  });

  const FREE_TASK_LIMIT = 10;

  if (taskCount >= FREE_TASK_LIMIT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Free plan task limit reached. Please upgrade to PRO",
    );
  }

  return true;
};


const updateSubscriptionPlan = async (
  userId: string,
  organizationId: string,
  payload: IUpdateSubscriptionPlan,
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

  if (member.role !== "MANAGER") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization managers can change the subscription plan",
    );
  }

  const subscription =
    await getOrganizationSubscription(organizationId);

  if (subscription.plan === payload.plan) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Organization is already on the ${payload.plan} plan`,
    );
  }

  const updatedSubscription = await prisma.subscription.update({
    where: {
      organizationId,
    },
    data: {
      plan: payload.plan,
      status: "ACTIVE",
    },
  });

  return updatedSubscription;
};

export const subscriptionService = {
  getSubscription,
  checkProjectLimit,
  checkTeamLimit,
  checkTaskLimit,
  getOrganizationSubscription,
  updateSubscriptionPlan
};