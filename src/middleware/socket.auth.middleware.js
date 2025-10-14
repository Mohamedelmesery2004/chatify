import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import asyncHandler from "express-async-handler";

import statusCode from "http-status";

export const socketAuthMiddleware = asyncHandler(async (socket, next) => {
    console.log("Auth middleware triggered for socket:", socket.id);
    const token = socket.handshake.query.token; // Extract token from query params
    console.log("Token received:", token ? "Present" : "Missing");
    if (!token) {
        console.log("No token provided");
        return next(new Error("Authentication error: Token missing"));
    }

    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        console.log("Token decoded:", decoded);
        if (!decoded || !decoded.userId) {
            console.log("Invalid token structure");
            return next(new Error("Authentication error: Invalid token"));
        }
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            console.log("User not found for ID:", decoded.userId);
            return next(new Error("Authentication error: User not found"));
        }
        socket.user = user;
        socket.userId = user._id;
        console.log("Authentication successful for user:", user._id);
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return next(new Error("Authentication error: Token verification failed"));
    }
});
