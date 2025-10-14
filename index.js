import express from "express"
import dotenv from "dotenv"
import authRoutes from "./src/routes/auth.route.js"
import messageRoutes from "./src/routes/message.route.js"
import storyRoutes from "./src/routes/story.route.js"
import updateRoutes from "./src/routes/update.route.js"
import callRoutes from "./src/routes/call.route.js"
import searchRoutes from "./src/routes/search.route.js"
import uploadRoutes from "./src/routes/upload.route.js"
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
import{ENV} from "./src/lib/env.js";
import {app,server} from "./src/lib/soket.js";
import cors from "cors";
const port = ENV.PORT;
app.use(express.json())
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }))
app.use(cookieParser());
// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));
app.use("/api/auth",authRoutes)
app.use("/api/message",messageRoutes)
app.use("/api/story",storyRoutes)
app.use("/api/update",updateRoutes)
app.use("/api/call",callRoutes)
app.use("/api/search",searchRoutes)
app.use("/api/upload", uploadRoutes)
server.listen(port,()=>{
    console.log("server is running at 3000")
    connectDB();
})