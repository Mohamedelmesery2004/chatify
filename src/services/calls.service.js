import mongoose from "mongoose";
import Calls from "../models/Calls.js";

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function parsePagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function initiateCall({ callerId, receiverId, callType = "audio", roomId }) {
  if (!isValidObjectId(callerId) || !isValidObjectId(receiverId)) {
    return { ok: false, reason: "INVALID_USER" };
  }
  if (!["audio", "video"].includes(callType)) {
    return { ok: false, reason: "INVALID_TYPE" };
  }
  const call = await Calls.create({
    caller: callerId,
    receiver: receiverId,
    callType,
    status: "ringing",
    roomId: roomId || undefined,
  });
  return { ok: true, call };
}

export async function acceptCall({ callId, roomId }) {
  if (!isValidObjectId(callId)) return { ok: false, reason: "INVALID_CALL" };
  const call = await Calls.findById(callId);
  if (!call) return { ok: false, reason: "NOT_FOUND" };
  if (["rejected", "missed", "ended", "cancelled"].includes(call.status)) {
    return { ok: false, reason: "FINALIZED" };
  }
  call.status = "accepted";
  call.startedAt = new Date();
  if (roomId) call.roomId = roomId;
  await call.save();
  return { ok: true, call };
}

export async function rejectCall({ callId }) {
  if (!isValidObjectId(callId)) return { ok: false, reason: "INVALID_CALL" };
  const call = await Calls.findById(callId);
  if (!call) return { ok: false, reason: "NOT_FOUND" };
  if (["accepted", "ended"].includes(call.status)) {
    return { ok: false, reason: "CANNOT_REJECT" };
  }
  call.status = "rejected";
  call.endedAt = new Date();
  await call.save();
  return { ok: true, call };
}

export async function cancelCall({ callId }) {
  if (!isValidObjectId(callId)) return { ok: false, reason: "INVALID_CALL" };
  const call = await Calls.findById(callId);
  if (!call) return { ok: false, reason: "NOT_FOUND" };
  if (["accepted", "ended"].includes(call.status)) {
    return { ok: false, reason: "CANNOT_CANCEL" };
  }
  call.status = "cancelled";
  call.endedAt = new Date();
  await call.save();
  return { ok: true, call };
}

export async function endCall({ callId }) {
  if (!isValidObjectId(callId)) return { ok: false, reason: "INVALID_CALL" };
  const call = await Calls.findById(callId);
  if (!call) return { ok: false, reason: "NOT_FOUND" };
  call.status = "ended";
  if (!call.startedAt) call.startedAt = new Date();
  call.endedAt = new Date();
  await call.save();
  return { ok: true, call };
}

export async function listCallsFor(userId, { skip = 0, limit = 20 } = {}, { withUser, status } = {}) {
  if (!isValidObjectId(userId)) return { ok: false, reason: "INVALID_USER" };

  const base = { $or: [{ caller: userId }, { receiver: userId }] };
  if (withUser && isValidObjectId(withUser)) {
    base.$and = [
      { $or: [{ caller: userId }, { receiver: userId }] },
      { $or: [{ caller: withUser }, { receiver: withUser }] },
    ];
    delete base.$or;
  }
  if (status) {
    base.status = status;
  }

  const calls = await Calls.find(base)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("caller", "fullName email profPic")
    .populate("receiver", "fullName email profPic");

  return { ok: true, calls };
}

