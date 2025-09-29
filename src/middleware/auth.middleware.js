import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import asynchandeler from "express-async-handler";
import statusCode from "http-status";

export const protectedRoute = asynchandeler(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res
      .status(statusCode.NOT_FOUND)
      .json({ msg: "invalid cradentials " });
  }
  const decoded = jwt.verify(token, ENV.JWT_SECRET);
  if (!decoded) {
    return res.status(statusCode.UNAUTHORIZED).json({ msg: "UNAUTHORIZED" });
  }
  const user = await User.findOne({ _id: decoded.userId }).select("-password");
  if (!user) {
    return res.status(statusCode.NOT_FOUND).json({ msg: "user not found" });
  }
  req.user= user;
  next();
});
