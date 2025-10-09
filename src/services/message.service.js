import Message from "../models/Message.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudenary.js";
import validator from "validator";
import { findChatPartners } from "./search.services.js";
export async function listContactsFor(userId) {
  // Return only users who have chatted with this user (actual contacts)
  const users = await findChatPartners(userId);
  return users;
} 

export function parsePagination(query) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "25", 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Build a Mongo criteria object for a given UI type filter
function buildTypeCriteria(type) {
  if (!type) return null;
  const t = String(type).toLowerCase();
  if (t === "gif" || t === "gifs") return { messageType: "image", isGif: true };
  if (["photo", "photos", "image", "images"].includes(t)) return { messageType: "image" };
  if (["video", "videos"].includes(t)) return { messageType: "video" };
  if (["audio", "audios"].includes(t)) return { messageType: "audio" };
  if (["voice", "voicenote", "voice_note", "voice-note"].includes(t)) return { messageType: "voiceNote" };
  if (["file", "files", "document", "documents"].includes(t)) return { messageType: "file" };
  if (["poll", "polls"].includes(t)) return { messageType: "poll" };
  if (["link", "links"].includes(t)) return { messageType: "link" };
  return null;
}

// Generic lister for messages by type across a user's chats
async function listMessagesForUserByType(userId, typeCriteria, projection, { skip, limit }, sort = -1) {
  const query = {
    $and: [
      { $or: [{ sender: userId }, { receiver: userId }] },
      typeCriteria || {},
    ],
  };
  // Remove empty criteria object if not provided
  if (!typeCriteria) query.$and.pop();
  return Message.find(query)
    .select(projection)
    .sort({ createdAt: sort })
    .skip(skip)
    .limit(limit);
}

export async function fetchMessagesBetween(userId, otherId, { skip, limit }, type) {
  const base = {
    $or: [
      { sender: userId, receiver: otherId },
      { sender: otherId, receiver: userId },
    ],
  };
  const criteria = buildTypeCriteria(type);
  if (criteria) Object.assign(base, criteria);
  return Message.find(base)
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);
}

export async function composeAndStoreMessage({ senderId, receiverId, payload }) {
  const { text, media, poll, voiceNote, file, video, messageType, linkUrl, isGif } = payload;

  if (!text && !media && !poll && !voiceNote && !file && !video) {
    return { ok: false, reason: "MISSING_CONTENT" };
  }

  const doc = {
    sender: senderId,
    receiver: receiverId,
  };

  if (text) {
    doc.text = text;
    doc.messageType = "text";
  } else if (poll) {
    if (!poll?.question || !Array.isArray(poll?.options) || poll?.options.length < 2) {
      return { ok: false, reason: "INVALID_POLL" };
    }
    doc.poll = poll;
    doc.messageType = "poll";
  } else if (linkUrl) {
    // optional link message type
    if (!validator.isURL(String(linkUrl))) {
      return { ok: false, reason: "INVALID_LINK" };
    }
    doc.linkUrl = linkUrl;
    doc.messageType = "link";
  } else if (media || voiceNote || file || video) {
    // Decide the type by explicit messageType or by provided field
    const intendedType = messageType || (voiceNote ? "voiceNote" : file ? "file" : video ? "video" : "audio" /* if raw audio sent in media */) || "image";
    const raw = media || voiceNote || file || video;

    // Map resource type for Cloudinary
    const resource_type = intendedType === "image" ? "image" : intendedType === "video" ? "video" : "auto";
    const upload = await cloudinary.uploader.upload(raw, { resource_type });

    if (intendedType === "voiceNote") {
      doc.voiceNoteUrl = upload.secure_url;
      doc.messageType = "voiceNote";
    } else if (intendedType === "file") {
      doc.mediaUrl = upload.secure_url;
      doc.messageType = "file";
    } else if (intendedType === "video") {
      doc.mediaUrl = upload.secure_url;
      doc.messageType = "video";
    } else if (intendedType === "audio") {
      doc.mediaUrl = upload.secure_url;
      doc.messageType = "audio";
    } else {
      // default to image
      doc.mediaUrl = upload.secure_url;
      doc.messageType = "image";
      if (isGif === true) doc.isGif = true;
    }
  }

  const newMessage = await Message.create(doc);
  return { ok: true, message: newMessage };
}
