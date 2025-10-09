import mongoose from "mongoose";
import Story from "../models/Story.js";
import User from "../models/User.js";

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function parsePagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function createStory({ ownerId, mediaUrl, mediaType = "image", caption }) {
  if (!isValidObjectId(ownerId)) return { ok: false, reason: "INVALID_USER" };
  if (!mediaUrl) return { ok: false, reason: "MISSING_MEDIA" };
  if (!["image", "video"].includes(mediaType)) return { ok: false, reason: "INVALID_MEDIA_TYPE" };

  const story = await Story.create({ owner: ownerId, mediaUrl, mediaType, caption });
  return { ok: true, story };
}

export async function listFeedFor(viewerId, { skip = 0, limit = 20 } = {}) {
  if (!isValidObjectId(viewerId)) return { ok: false, reason: "INVALID_USER" };
  const viewer = await User.findById(viewerId).select("mutedUsers");
  if (!viewer) return { ok: false, reason: "USER_NOT_FOUND" };

  const now = new Date();
  const filter = {
    owner: { $nin: viewer.mutedUsers || [] },
    expiresAt: { $gt: now },
  };

  const stories = await Story.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("owner", "fullName email profPic");
  return { ok: true, stories };
}

export async function listMine(ownerId, { skip = 0, limit = 20 } = {}) {
  if (!isValidObjectId(ownerId)) return { ok: false, reason: "INVALID_USER" };
  const now = new Date();
  const stories = await Story.find({ owner: ownerId, expiresAt: { $gt: now } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("owner", "fullName email profPic");
  return { ok: true, stories };
}

export async function addView({ viewerId, storyId }) {
  if (!isValidObjectId(viewerId) || !isValidObjectId(storyId)) return { ok: false, reason: "INVALID_IDS" };
  const story = await Story.findById(storyId);
  if (!story) return { ok: false, reason: "NOT_FOUND" };
  const exists = story.views?.some((v) => String(v.user) === String(viewerId));
  if (!exists) {
    story.views.push({ user: viewerId, viewedAt: new Date() });
    await story.save();
  }
  return { ok: true, story };
}

export async function deleteStory({storyId}) {
  if (!isValidObjectId(storyId)) return { ok: false, reason: "INVALID_IDS" };
  const story = await Story.findByIdAndDelete(storyId);
  if (!story) return { ok: false, reason: "NOT_FOUND" };
  return { ok: true, story };
}
export async function muteUserStories({ viewerId, targetUserId }) {
  if (!isValidObjectId(viewerId) || !isValidObjectId(targetUserId)) return { ok: false, reason: "INVALID_IDS" };
  await User.updateOne({ _id: viewerId }, { $addToSet: { mutedUsers: targetUserId } });
  return { ok: true };
}
export async function unmuteUserStories({ viewerId, targetUserId }) {
  if (!isValidObjectId(viewerId) || !isValidObjectId(targetUserId)) return { ok: false, reason: "INVALID_IDS" };
  await User.updateOne({ _id: viewerId }, { $pull: { mutedUsers: targetUserId } });
  return { ok: true };
}