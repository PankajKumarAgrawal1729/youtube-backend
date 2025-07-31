import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const owner = req.user;
  const content = req.content;
  const tweet = await Tweet.create({
    owner,
    content,
  });

  if (!tweet) {
    throw new ApiError(500, "Tweet not created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet created Successfully", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

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
        as: "tweets",
      },
    },
    { $unwind: "tweets" },
  ]);

  if (!tweets) {
    throw new ApiError(500, "Error while fetching tweets");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweets fetched Successfully", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  const updateContent = req.body;
  const userId = req.user?._id;
  const { tweetId } = req.params;

  if (!updateContent) {
    throw new ApiError(400, "Please provide update Content");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    { _id: tweetId, owner: userId },
    { $set: { content: updateContent } },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(500, "Tweet not updated");
  }

  return res.status(200).json(200, "Tweet Updated Successfully", tweet);
});

const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params;
  const userId = req.user?._id;

  const tweet = await Tweet.findByIdAndDelete({ _id: tweetId, owner: userId });

  if (!tweet) {
    throw new ApiError(500, "Tweet not Deleted");
  }

  return res.status(200).json(200, "Tweet deleted Successfully", tweet);
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
