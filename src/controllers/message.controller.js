import statusCode from "http-status";
import asyncHandler from "express-async-handler";
import { listContactsFor, parsePagination, isValidObjectId, fetchMessagesBetween, composeAndStoreMessage} from "../services/message.service.js";
import{findChatPartners} from "../services/search.services.js"
import { getRecieversSocket, io } from "../lib/soket.js";

export const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await listContactsFor(req.user._id);
  return res.status(statusCode.OK).json({success:true , data:[contacts]});
});

export const getMessagesBetweenUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: "Invalid user id" } ]});
  }
  const userId = req.user._id;
  const { page, limit, skip } = parsePagination(req.query);
  const { type } = req.query; // optional filter
  const messages = await fetchMessagesBetween(userId, id, { skip, limit }, type);
  return res.status(statusCode.OK).json({success:true , data:[{ page, limit, count: messages.length, messages }] });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: "Invalid user id" } ]});
  }
  const result = await composeAndStoreMessage({
    senderId: req.user._id,
    receiverId: id,
    payload: req.body,
  });
  if (!result.ok) {
    const msg = result.reason === "INVALID_POLL" ? "Invalid poll structure" : "Message content is required";
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg } ]});
  }
  const newMessage = result.message;
  const receiverSocket = getRecieversSocket(id);
  if (receiverSocket) {
    io.to(receiverSocket.id).emit("newMessage", newMessage);
  }
  return res.status(statusCode.CREATED).json({success:true , data:[newMessage]});
});

export const chatPartners = asyncHandler(async (req, res) => {
  const users = await findChatPartners(req.user._id);
  return res.status(statusCode.OK).json({success:true , data:[users]});
});
