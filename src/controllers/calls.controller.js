import statusCode from "http-status";
import expressAsyncHandler from "express-async-handler";
import {
  initiateCall,
  acceptCall as acceptCallSvc,
  rejectCall as rejectCallSvc,
  cancelCall as cancelCallSvc,
  endCall as endCallSvc,
  listCallsFor,
  parsePagination,
  isValidObjectId,
} from "../services/calls.service.js";
import { getRecieversSocket, io } from "../lib/soket.js";

export const startCall = expressAsyncHandler(async (req, res) => {
  const { id } = req.params; // receiver id
  const { callType = "audio", roomId } = req.body || {};
  if (!isValidObjectId(id)) {
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: "Invalid user id" } ]});
  }
  const result = await initiateCall({
    callerId: req.user._id,
    receiverId: id,
    callType,
    roomId,
  });
  if (!result.ok) {
    const map = {
      INVALID_USER: "Invalid users",
      INVALID_TYPE: "Invalid call type",
    };
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: map[result.reason] || "Cannot start call" } ]});
  }
  const call = result.call;
  const receiverSocket = getRecieversSocket(String(id));
  if (receiverSocket) {
    io.to(receiverSocket.id).emit("call:incoming", call);
  }
  return res.status(statusCode.CREATED).json({success:true , data:[call]});
});

export const acceptCall = expressAsyncHandler(async (req, res) => {
  const { callId } = req.params;
  const { roomId } = req.body || {};
  const result = await acceptCallSvc({ callId, roomId });
  if (!result.ok) {
    const map = {
      INVALID_CALL: "Invalid call id",
      NOT_FOUND: "Call not found",
      FINALIZED: "Call already finalized",
    };
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: map[result.reason] || "Cannot accept call" } ]});
  }
  const call = result.call;
  const otherUserId = String(call.caller);
  const socket = getRecieversSocket(otherUserId);
  if (socket) io.to(socket.id).emit("call:accepted", call);
  return res.status(statusCode.OK).json({success:true , data:[call]});
});

export const rejectCall = expressAsyncHandler(async (req, res) => {
  const { callId } = req.params;
  const result = await rejectCallSvc({ callId });
  if (!result.ok) {
    const map = {
      INVALID_CALL: "Invalid call id",
      NOT_FOUND: "Call not found",
      CANNOT_REJECT: "Cannot reject this call",
    };
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: map[result.reason] || "Cannot reject call" } ]});
  }
  const call = result.call;
  const notifyIds = [String(call.caller), String(call.receiver)];
  notifyIds.forEach((uid) => {
    const s = getRecieversSocket(uid);
    if (s) io.to(s.id).emit("call:rejected", call);
  });
  return res.status(statusCode.OK).json({success:true , data:[call]});
});

export const cancelCall = expressAsyncHandler(async (req, res) => {
  const { callId } = req.params;
  const result = await cancelCallSvc({ callId });
  if (!result.ok) {
    const map = {
      INVALID_CALL: "Invalid call id",
      NOT_FOUND: "Call not found",
      CANNOT_CANCEL: "Cannot cancel this call",
    };
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: map[result.reason] || "Cannot cancel call" } ]});
  }
  const call = result.call;
  const notifyIds = [String(call.caller), String(call.receiver)];
  notifyIds.forEach((uid) => {
    const s = getRecieversSocket(uid);
    if (s) io.to(s.id).emit("call:cancelled", call);
  });
  return res.status(statusCode.OK).json({success:true , data:[call]});
});

export const endCall = expressAsyncHandler(async (req, res) => {
  const { callId } = req.params;
  const result = await endCallSvc({ callId });
  if (!result.ok) {
    const map = {
      INVALID_CALL: "Invalid call id",
      NOT_FOUND: "Call not found",
    };
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: map[result.reason] || "Cannot end call" } ]});
  }
  const call = result.call;
  const notifyIds = [String(call.caller), String(call.receiver)];
  notifyIds.forEach((uid) => {
    const s = getRecieversSocket(uid);
    if (s) io.to(s.id).emit("call:ended", call);
  });
  return res.status(statusCode.OK).json({success:true , data:[call]});
});

export const myCalls = expressAsyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { withUser, status } = req.query;
  const result = await listCallsFor(req.user._id, { skip, limit }, { withUser, status });
  if (!result.ok) {
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: "Invalid user" } ]});
  }
  return res.status(statusCode.OK).json({success:true , data:[result.calls]});
});

