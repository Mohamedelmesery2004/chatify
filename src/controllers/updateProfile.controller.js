import statusCode from "http-status";
import asyncHandler from "express-async-handler";
import { updateProfilePicture } from "../services/updateProfile.service.js";

export const updateProfile = asyncHandler(async (req, res) => {
    const { profPic } = req.body;
    if (!profPic) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ msg: "the field is required" });
    }
    const result = await updateProfilePicture(req.user._id, profPic);
    if (!result.ok) {
      return res.status(statusCode.BAD_REQUEST).json({ msg: "the field is required" });
    }
    return res.status(statusCode.OK).json(result.user);
  });   