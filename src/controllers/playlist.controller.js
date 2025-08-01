import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Playlist name required");
  }

  if (!description || description.trim() === "") {
    throw new ApiError(400, "Playlist description required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(500, "Playlist creation failed");
  }

  return res.status(200).json(200, "Playlist Created Successfully", playlist);
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID required");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (!playlists) {
    throw new ApiError(500, "Playlist fetching failed");
  }

  if (playlists.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No Playlist Available", {}));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlists fetched Successfully", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, `No Playlist found with Id: ${playlistId}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist Fetched Successsfully", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const updatedPlayList = await Playlist.findByIdAndUpdate(
    playlistId,
    { $push: { videos: videoId } },
    { new: true, runValidators: true }
  );

  if (!updatedPlayList) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video added to playlist successfully",
        updatedPlayList
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const updatedPlayList = await Playlist.findByIdAndUpdate(playlistId, {
    $pop: { videos: videoId },
  });

  if (!updatedPlayList) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video removed to playlist successfully",
        updatedPlayList
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted successfully", {}));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const updatedField = {};
  if (name) {
    updatedField.name = name;
  }

  if (description) {
    updatedField.description = description;
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      ...updatedField,
    },
    { new: true }
  );

  if (!updatePlaylist) {
    throw new ApiError(500, "Playlist details Updation Failed");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Playlist Details Updated Successfully",
        updatePlaylist
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
