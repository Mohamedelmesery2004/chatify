import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudenary.js";

export async function listContactsFor(userId) {
  const loggedUser = await User.findById(userId).select("-password");
  const contacts = await User.find({ _id: { $ne: loggedUser._id } }).select("-password");
  return contacts;
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

export async function fetchMessagesBetween(userId, otherId, { skip, limit }) {
  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: otherId },
      { sender: otherId, receiver: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);
  return messages;
}

export async function composeAndStoreMessage({ senderId, receiverId, payload }) {
  const { text, media, poll, voiceNote, file, video, messageType } = payload;

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
  } else if (media || voiceNote || file || video) {
    const intendedType = messageType || (voiceNote ? "audio" : file ? "file" : video ? "video" : "image");
    const raw = media || voiceNote || file || video;
    const upload = await cloudinary.uploader.upload(raw, {
      resource_type: intendedType === "image" ? "image" : intendedType === "video" ? "video" : "auto",
    });
    doc.media = upload.secure_url;
    doc.messageType = intendedType;
  }

  const newMessage = await Message.create(doc);
  return { ok: true, message: newMessage };
}

export async function findChatPartners(userId) {
  const messages = await Message.find({
    $or: [
      { sender: userId },
      { receiver: userId },
    ],
  });
  const partners = messages.map((m) => (m.sender.toString() === userId.toString() ? m.receiver : m.sender));
  const uniquePartners = [...new Set(partners)];
  const users = await User.find({ _id: { $in: uniquePartners } }).select("-password");
  return users;
}
