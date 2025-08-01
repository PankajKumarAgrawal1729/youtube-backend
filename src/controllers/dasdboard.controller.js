import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const channelStats = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videoDetails",
        pipeline: [
          {
            $project: {
              views: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        videoCount: { $size: "$videoDetails" },
        viewCount: { $sum: "#videoDetails.views" },
        subscriberCount: { $size: "$subscribers" },
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        fullname: 1,
        avatar: 1,
        coverImage: 1,
        videoCount: 1,
        viewCount: 1,
        subscriberCount: 1,
      },
    },
  ]);

  if (!channelStats) {
    throw new ApiError(404, "failed to fetched Channel Details");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Channel details fetched successfully!",
        channelStats
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const channelVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (!channelVideos) {
    throw new ApiError(500, "Unable to fetch Videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "All Videos fetched Successfully!", channelVideos)
    );
});

export { getChannelStats, getChannelVideos };
