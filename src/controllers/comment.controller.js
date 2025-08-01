import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videoComments = await Comment.aggregatePaginate(
    Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
          pipeline: [
            {
              $project: {
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]),
    options
  );

  if (!videoComments) {
    throw new ApiError(500, "Failed to get Comments");
  }

  if (videoComments.length === 0) {
    return res.status(200).json(new ApiResponse(200, "No Comments Found"), {});
  }

  return res
    .status(200)
    .json(200, "Comments Fetched Successfully", videoComments);
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;
  const { content } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video Id Is Incorrect");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: video,
    owner: user,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to create Comment");
  }

  return res.status(201, "Comment added Successfully", comment);
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { updatedContent } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  if (!updatedContent || updatedContent.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId },
    { content: updateComment.trim() },
    { new: true }
  );

  if (!updateComment) {
    throw new ApiError(
      404,
      "Comment not found or you're not authorized to update this comment"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment Updated Successfully", updatedComment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  const deletedComment = await Comment.findOneAndDelete({ _id: commentId });

  if (!deletedComment) {
    throw new ApiError(
      404,
      "Comment not found or you're not authorized to update this comment"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment Deleted Successfully", {}));
});

export { getVideoComments, addComment, updateComment, deleteComment };
