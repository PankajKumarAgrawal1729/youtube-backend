import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriber = req.user._id;

  // Check if the channel exists
  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, `Channel Id ${channelId} is not present`);
  }

  // Check if subscription already exists
  const isExist = await Subscription.findOne({
    subscriber: subscriber,
    channel: channelId,
  });
  let toggleSubscription = undefined;
  let msg = "";
  if (isExist) {
    toggleSubscription = await Subscription.deleteOne({
      subscriber: subscriber,
      channel: channelId,
    });
    if (!toggleSubscription.deletedCount) {
      throw new ApiError(500, "Failed to unsubscribe from channel");
    }
    msg = "Successfully unsubscribed from channel";
  } else {
    toggleSubscription = await Subscription.create({
      subscriber: subscriber,
      channel: channelId,
    });
    if (!toggleSubscription) {
      throw new ApiError(500, "Failed to subscribe to channel");
    }
    msg = "Successfully subscribed to channel";
  }

  return res.status(200).json(new ApiResponse(200, toggleSubscription, msg));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const userChannelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    { $unwind: "$subscribers" },
  ]);

  if (!userChannelSubscribers || userChannelSubscribers.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "No subscribers found for this channel")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userChannelSubscribers,
        "Channel subscribers fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannels",
      },
    },
    { $unwind: "$subscribedChannels" },
  ]);

  if (!subscribedChannels || subscribedChannels.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "No subscribed channels found for this user")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
