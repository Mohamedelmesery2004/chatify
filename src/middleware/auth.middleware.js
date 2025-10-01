import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import asyncHandler from "express-async-handler";
import statusCode from "http-status";

export const protectedRoute = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res
      .status(statusCode.UNAUTHORIZED)
      .json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({ msg: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(statusCode.UNAUTHORIZED)
      .json({ msg: "Token is not valid" });
  }
});
