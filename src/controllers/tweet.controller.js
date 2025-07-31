import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const owner = req.user._id;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Tweet content is required");
  }

  const tweet = await Tweet.create({
    owner,
    content: content.trim(),
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    { 
      $unwind: "$ownerDetails" 
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        "ownerDetails.username": 1,
        "ownerDetails.fullname": 1,
        "ownerDetails.avatar": 1,
      },
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  if (!tweets || tweets.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No tweets found for this user"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;
  const { tweetId } = req.params;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Tweet content is required");
  }

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: userId },
    { $set: { content: content.trim() } },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(404, "Tweet not found or you're not authorized to update this tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  const tweet = await Tweet.findOneAndDelete({ 
    _id: tweetId, 
    owner: userId 
  });

  if (!tweet) {
    throw new ApiError(404, "Tweet not found or you're not authorized to delete this tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
