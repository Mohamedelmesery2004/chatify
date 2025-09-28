import express from "express"
import dotenv from "dotenv"
import authRoutes from "./src/routes/auth.route.js"
import messageRoutes from "./src/routes/message.route.js"
dotenv.config();
const app = express();
const port = process.env.PORT;
app.use("/api/auth",authRoutes)
app.use("/api/message",messageRoutes)

app.listen(port,()=>{
    console.log("server is running at 3000")
})