import statusCode from "http-status";
import asyncHandler from "express-async-handler";
import { parsePagination } from "../services/message.service.js";
import { listPhotos, listGifs, listLinks, listPolls, listVideos, listAudios, listFiles,searchUsers as searchUsersService} from "../services/search.services.js";
// List all photo messages (images, including GIFs) where the requester is sender or receiver
export const getMyPhotos = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const messages = await listPhotos(req.user._id, { skip, limit });
    return res.status(statusCode.OK).json({success:true , data:[{ page, limit, count: messages.length, messages }] });
  });
  
  export const getMyGifs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const messages = await listGifs(req.user._id, { skip, limit });
    return res.status(statusCode.OK).json({success:true , data:[{ page, limit, count: messages.length, messages }] });
  });
  
  export const getMyLinks = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const messages = await listLinks(req.user._id, { skip, limit });
    return res.status(statusCode.OK).json({success:true , data:[{ page, limit, count: messages.length, messages }] });
  });
  
  export const getMyPolls = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const messages = await listPolls(req.user._id, { skip, limit });
    return res.status(statusCode.OK).json({success:true , data:[{ page, limit, count: messages.length, messages }] });
  });
  
  export const getMyVideos = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const messages = await listVideos(req.user._id, { skip, limit });
    return res.status(statusCode.OK).json({success:true , data:[{ page, limit, count: messages.length, messages }] });
  });
  
  export const getMyAudios = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const messages = await listAudios(req.user._id, { skip, limit });
    return res.status(statusCode.OK).json({success:true , data:[{ page, limit, count: messages.length, messages }] });
  });
  
  export const getMyFiles = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const messages = await listFiles(req.user._id, { skip, limit });
    return res.status(statusCode.OK).json({success:true , data:[{ page, limit, count: messages.length, messages }] });
  });
  
  export const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: "Search query is required" } ]});
    }
    const users = await searchUsersService(req.user._id, query);
    return res.status(statusCode.OK).json({success:true , data:[users]});
  });
  
    