import type { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { commentService } from "./comment.service";
import {
  ICreateComment,
  IUpdateComment,
} from "./comment.interface";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.createComment(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.body as ICreateComment,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getComments = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.getComments(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.updateComment(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.params.commentId as string,
    req.body as IUpdateComment,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await commentService.deleteComment(
    req.user!.id,
    req.params.organizationId as string,
    req.params.projectId as string,
    req.params.taskId as string,
    req.params.commentId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

export const commentController = {
  createComment,
  getComments,
  updateComment,
  deleteComment
};