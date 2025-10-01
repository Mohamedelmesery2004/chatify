import express from "express"
import dotenv from "dotenv"
import authRoutes from "./src/routes/auth.route.js"
import messageRoutes from "./src/routes/message.route.js"
import { connectDB } from "./src/lib/db.js";
import cookieParser from "cookie-parser";
import{ENV} from "./src/lib/env.js";
import {app,server} from "./src/lib/soket.js";
dotenv.config();

const port = ENV.PORT;
app.use(express.json())
app.use(cookieParser());
app.use("/api/auth",authRoutes)
app.use("/api/message",messageRoutes)

server.listen(port,()=>{
    console.log("server is running at 3000")
    connectDB();
})