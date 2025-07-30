import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const videoLocalPath = req.file?.path;
  const thumbnailLocalPath = req.file?.path; // Assuming thumbnail is handled similarly
  const user = req?.user;
  const { title, description } = req.body;

  if (!videoLocalPath) {
    return new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    return new ApiError(400, "Thumbnail file is required");
  }
  if (!user) {
    return new ApiError(401, "User not authenticated");
  }
  if (!title || !description) {
    return new ApiError(400, "Title and description are required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video) {
    return new ApiError(500, "Failed to upload video to Cloudinary");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    return new ApiError(500, "Failed to upload thumbnail to Cloudinary");
  }

  const videoData = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail?.url,
    owner: user,
    title,
    description,
    duration: video?.duration,
  });
  if (!videoData) {
    return new ApiError(500, "Failed to save video data");
  }
  return res.status(201).json({
    success: true,
    data: videoData,
    message: "Video uploaded successfully",
  });
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy || "createdAt"]: sortType === "desc" ? -1 : 1 },
  };

  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" }; // Case-insensitive search
  }

  if (userId) {
    filter.owner = userId; // Filter by user ID
  }

  const videos = await Video.aggregatePaginate(
    Video.aggregate([
      {
        $match: {
          ...filter,
          isPublished: true, // Only published videos
        },
      },
      {
        $lookup: {
          from: "users", // Assuming the user collection is named 'users'
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: "$ownerDetails", // Unwind the owner details array
      },
      {
        $project: {
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          isPublished: 1,
          ownerDetails: {
            _id: "$ownerDetails._id",
            fullname: "$ownerDetails.fullname",
            avatar: "$ownerDetails.avatar",
          },
        }, // Project only the required fields
      },
    ])
  );
  if (!videos) {
    return new ApiError(404, "No videos found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully", videos.docs));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    return new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    return new ApiError(404, `Video with ID ${videoId} Does not exist`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    return new ApiError(400, "Video ID is required");
  }
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  let thumbnail = undefined;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
      return new ApiError(500, "Failed to update thumbnail to Cloudinary");
    }
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return new ApiError(404, `Video with ID ${videoId} Does not exist`);
  }

  if (title) {
    video.title = title;
  }

  if (description) {
    video.description = description;
  }

  if (thumbnail) {
    video.thumbnail = thumbnail?.url;
  }

  const updateVideo = await video.save();
  if (!updateVideo) {
    return new ApiError(500, "Video details are not Updated");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateVideo, "Video details updated Successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    return new ApiError(400, "Video ID is required");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deleteVideo) {
    return new ApiError(500, "Video is not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleteVideo, "Video deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    return new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    return new ApiError(404, `Video with ID ${videoId} Does not exist`);
  }

  video.isPublished = !video.isPublished;

  const updateVideoPublishStatus = await video.save();

  if (!updateVideoPublishStatus) {
    return new ApiError(500, "Video Status is not updated");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateVideoPublishStatus,
        "Video Publish Status updated successfully"
      )
    );
});

export {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
