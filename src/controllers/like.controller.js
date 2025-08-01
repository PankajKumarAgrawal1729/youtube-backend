import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "No Video found");
  }

  const videoLikeExist = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });
  let msg = "";
  if (videoLikeExist) {
    const deleteLike = await Like.findOneAndDelete({
      video: videoId,
      likedBy: userId,
    });

    if (!deleteLike) {
      throw new ApiError(500, "Video unliked Failed");
    }
    msg = "Video unliked successfully";
  } else {
    const addLike = await Like.create({
      video: videoId,
      likedBy: userId,
    });

    if (!addLike) {
      throw new ApiError(500, "Video liked Failed");
    }
    msg = "Video like successfully";
  }

  return res.status(200).json(new ApiResponse(200, msg, {}));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "No Comment found");
  }

  const commentLikeExist = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  let msg = "";
  if (commentLikeExist) {
    const deleteLike = await Like.findOneAndDelete({
      comment: commentId,
      likedBy: userId,
    });
    if (!deleteLike) {
      throw new ApiError(500, "Comment unliked Failed");
    }
    msg = "Comment unliked successfully";
  } else {
    const addLike = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    if (!addLike) {
      throw new ApiError(500, "Comment liked Failed");
    }
    msg = "Comment like successfully";
  }

  return res.status(200).json(new ApiResponse(200, msg, {}));
});
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "No Tweet found");
  }

  const tweetLikeExist = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });
  let msg = "";
  if (tweetLikeExist) {
    const deleteLike = await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: userId,
    });
    if (!deleteLike) {
      throw new ApiError(500, "Tweet unliked Failed");
    }
    msg = "Tweet unliked successfully";
  } else {
    const addLike = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    if (!addLike) {
      throw new ApiError(500, "Tweet liked Failed");
    }
    msg = "Tweet like successfully";
  }

  return res.status(200).json(new ApiResponse(200, msg, {}));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({}).select("--comment --tweet --likedBy");

  if (!likedVideos) {
    throw new ApiError(500, "Unable to fetched liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "LIked Video Fetched Successfully", likedVideos)
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
