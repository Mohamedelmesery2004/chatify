import express from express;
import {Server} from "socket.io";
import {ENV} from "./env.js";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.use(socketAuthMiddlware)

const socketUser ={}//to check the online user


io.on("connection", (socket) => {
    console.log("a user connected", socket.user.fullName);
    socketUser[socket.userId] = socket;

    io.on("getAllContacts", Object.Keys(socketUser))
    socket.on("disconnect", () => {
        console.log("user disconnected");
        delete socketUser[socket.userId];
        io.emit("getAllContacts", Object.Keys(socketUser))
    });
});

export default {app , io , server  };

