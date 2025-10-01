import express from "express";
import {Server} from "socket.io";
import {ENV} from "./env.js";
import http from "http";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.use(socketAuthMiddleware);

const socketUser ={}//to check the online user

//check the user online or not
export function getRecieversSocket(socketId)
{
    return socketUser[socketId]
}

io.on("connection", (socket) => {
    console.log("a user connected", socket.user.fullName);
    socketUser[socket.userId] = socket;

    // notify all clients about the current online users
    io.emit("getAllContacts", Object.keys(socketUser));
    socket.on("disconnect", () => {
        console.log("user disconnected");
        delete socketUser[socket.userId];
        io.emit("getAllContacts", Object.keys(socketUser));
    });
});

// Provide named exports to match `import {app,server} from "./src/lib/soket.js"`
export { app, io, server };

// Keep default export for flexibility (optional)
export default { app, io, server };

