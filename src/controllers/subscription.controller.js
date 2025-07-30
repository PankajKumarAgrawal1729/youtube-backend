import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { subscriber } = req.user;

  const channel = await User.aggregate([
    {
      $match: {
        subscriber: new mongoose.Schema.Types.ObjectId(subscriber._id),
        channel: new mongoose.Schema.Types.ObjectId(channelId),
      },
    },
    {
      $limit: 1,
    },
  ]);

  if (!channel) {
    return new ApiError(404, `Channel Id ${channelId} is not present`);
  }

  const isExist = await Subscription.aggregate([
    {
      $match: {
        subscriber,
        channel,
      },
    },
  ]);
  let toggleSubscription = undefined;
  let msg = "";
  if (isExist) {
    toggleSubscription = await Subscription.deleteOne({
      subscriber,
      channel,
    });
    if (!toggleSubscription) {
      return new ApiError(500, "No Action Performed");
    }
    msg = "Un-Subscribed Successfully";
  } else {
    toggleSubscription = await Subscription.create({
      subscriber,
      channel,
    });
    if (!toggleSubscription) {
      return new ApiError(500, "No Action Performed");
    }
    msg = "Subscribed Successfully";
  }

  return res.status(200).json(new ApiResponse(200, msg, toggleSubscription));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const userChannelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Schema.Types.ObjectId(channelId),
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
    { $unwind: "subscribers" },
  ]);

  if (!userChannelSubscribers) {
    return new ApiError(500, "Unable To fetch Subscribers");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subscribers fetched successfully",
        userChannelSubscribers
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Schema.Types.ObjectId(subscriberId),
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
    { $unwind: "subscribed" },
  ]);

  if (!subscribedChannels) {
    return new ApiError(500, "Error while fetching subscribed channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subscribed Channel fetched Successfully",
        subscribedChannels
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
