import statusCode from "http-status";
import asyncHandler from "express-async-handler";
import cloudinary from "../lib/cloudenary.js";
import { addView, createStory, listFeedFor, listMine, muteUserStories, unmuteUserStories, parsePagination, isValidObjectId , deleteStory as deleteStoryService  } from "../services/story.service.js";

export const create = asyncHandler(async (req, res) => {
  let { mediaUrl, mediaType, caption } = req.body || {};

  // If a file is provided (multipart/form-data), upload it to Cloudinary
  if (req.file) {
    const mime = req.file.mimetype || "";
    const inferredType = mime.startsWith("video/") ? "video" : mime.startsWith("image/") ? "image" : undefined;
    if (!inferredType) {
      return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: "Only image or video files are allowed" } ]});
    }
    // Upload using data URI to avoid extra deps
    const dataUri = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
    const uploadRes = await cloudinary.uploader.upload(dataUri, {
      resource_type: "auto",
      folder: "stories",
    });
    mediaUrl = uploadRes.secure_url;
    mediaType = inferredType;
  }

  const result = await createStory({ ownerId: req.user._id, mediaUrl, mediaType, caption });
  if (!result.ok) {
    const reason = result.reason;
    const msg = reason === "MISSING_MEDIA" ? "mediaUrl is required" : reason === "INVALID_MEDIA_TYPE" ? "mediaType must be 'image' or 'video'" : "Invalid request";
    return res.status(statusCode.BAD_REQUEST).json({ msg });
  }
  return res.status(statusCode.CREATED).json({success:true , data:[result.story]});
});

export const feed = asyncHandler(async (req, res) => {
  const { skip, limit } = parsePagination(req.query);
  const result = await listFeedFor(req.user._id, { skip, limit });
  if (!result.ok) return res.status(statusCode.BAD_REQUEST).json({ msg: "Unable to fetch feed" });
  return res.status(statusCode.OK).json({ success:true , data:[{ limit, count: result.stories.length, stories: result.stories }] });
});

export const mine = asyncHandler(async (req, res) => {
  const { skip, limit } = parsePagination(req.query);
  const result = await listMine(req.user._id, { skip, limit });
  if (!result.ok) return res.status(statusCode.BAD_REQUEST).json({ msg: "Unable to fetch stories" });
  return res.status(statusCode.OK).json({ success:true , data:[{ limit, count: result.stories.length, stories: result.stories }] });
});

export const view = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(statusCode.BAD_REQUEST).json({ msg: "Invalid story id" });
  const result = await addView({ viewerId: req.user._id, storyId: id });
  if (!result.ok) return res.status(statusCode.NOT_FOUND).json({success:false , data:[{ msg: "Story not found" }] });
  return res.status(statusCode.OK).json({success:true , data:[result.story]});
});



export const mute = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "Invalid user id" }] });
  const result = await muteUserStories({ viewerId: req.user._id, targetUserId: userId });
  if (!result.ok) return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "Unable to mute user" }] });
  return res.status(statusCode.OK).json({success:true , data:[{ ok: true }] });
});

export const unmute = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "Invalid user id" }] });
  const result = await unmuteUserStories({ viewerId: req.user._id, targetUserId: userId });
  if (!result.ok) return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "Unable to unmute user" }] });
  return res.status(statusCode.OK).json({success:true , data:[{ ok: true }] });
});

export const deleteStory = asyncHandler(async(req,res)=>{
  const {id} = req.params;
  const result = await deleteStoryService({storyId:id});
  if(!result.ok) return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "Unable to delete story" }] });
  return res.status(statusCode.OK).json({success:true , data:[{ ok: true }] });
})