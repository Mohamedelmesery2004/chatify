import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import asyncHandler from "express-async-handler";
import statusCode from "http-status";

export const socketAuthMiddleware = asyncHandler(async (socket, next) => {
    const token = socket.handshake.headers.cookie
    ?.split(";").find((cookie) => cookie.startsWith("jwt="))?.split("=")[1];
    if (!token) {
        return next(new Error("Authentication error"));
    }
 
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded){
            return next(new Error("Authentication error"));
        }
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return next(new Error("User not found"));
        }
        socket.user = user;
        socket.userId = user._id;
        next();
    
});
