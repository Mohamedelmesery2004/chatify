import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import asyncHandler from "express-async-handler";
import statusCode from "http-status";

export const protectedRoute = asyncHandler(async (req, res, next) => {
  // Prefer cookie, but allow Authorization: Bearer <token> for tools like Postman
  let token = req.cookies?.jwt;
  if (!token) {
    const authHeader = req.headers?.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token)
    return res.status(statusCode.UNAUTHORIZED).json({ msg: "Unauthorized: missing token" });

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({ msg: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(statusCode.UNAUTHORIZED).json({ msg: "Unauthorized: invalid or expired token" });
  }
});
