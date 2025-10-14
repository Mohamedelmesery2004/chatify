import express from "express";
import { Server } from "socket.io";
import { ENV } from "./env.js";
import http from "http";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import { composeAndStoreMessage, isValidObjectId , fetchMessagesBetween} from "../services/message.service.js";
import { markMessagesRead } from "../services/message.service.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

// Track multiple sockets per user for multi-device support
const userSockets = new Map(); // userId -> Set<socket>

// Helper: get Set of sockets for a user
function getReceiverSockets(userId) {
  return userSockets.get(String(userId));
}

// Helper: deterministic room id for 1:1 conversation
function roomFor(u1, u2) {
  return [String(u1), String(u2)].sort().join(":");
}

// Broadcast presence to all clients
function emitPresence() {
  io.emit("presence:update", Array.from(userSockets.keys()));
}

// Backward-compatible helper: return one socket for a user (if any)
function getRecieversSocket(userId) {
  const set = getReceiverSockets(userId);
  if (!set || set.size === 0) return undefined;
  // return the first socket in the set
  for (const s of set) return s;
}

io.on("connection", (socket) => {
  console.log("New socket connection attempt");
  if (socket.userId) {
    console.log(socket.userId, " user connected successfully");
  } else {
    console.log("Socket connected but no userId - authentication failed");
  }
  // Register socket under user
  const uid = String(socket.userId);
  if (!userSockets.has(uid)) userSockets.set(uid, new Set());
  userSockets.get(uid).add(socket);

  // Initial presence
  emitPresence();

  // Client signals they opened a chat with a peer 
  socket.on("chat:join", (payload = {}, ack) => {
    console.log("chat:join event received for user:", uid, "with payload:", payload);
    try {
      const { peerId } = payload;
      if (!isValidObjectId(peerId)) {
        console.log("Invalid peerId:", peerId);
        return ack && ack({ ok: false, error: "INVALID_PEER_ID" });
      }
      const room = roomFor(uid, peerId);
      socket.join(room);
      console.log("User joined room:", room);
      return ack && ack({ ok: true, room });
    } catch (e) {
      console.error("Error in chat:join:", e.message);
      return ack && ack({ ok: false, error: e.message });
    }
  });

  // Send message with persistence and room broadcast
  socket.on("message:send", async (payload = {}, ack) => {
    console.log("message:send event received for user:", uid, "with payload:", payload);
    try {
      const { receiverId, ...rest } = payload;
      if (!isValidObjectId(receiverId)) {
        console.log("Invalid receiverId:", receiverId);
        return ack && ack({ ok: false, error: "INVALID_RECEIVER_ID" });
      }
      const result = await composeAndStoreMessage({
        senderId: uid,
        receiverId,
        payload: rest,
      });
      if (!result.ok) {
        console.log("composeAndStoreMessage failed:", result.reason);
        return ack && ack({ ok: false, error: result.reason || "INVALID_MESSAGE" });
      }
      const message = result.message;
      const room = roomFor(uid, receiverId);
      io.to(room).emit("message:new", message);
      console.log("Message sent successfully, sending ack");

      // Delivery receipt back to sender if receiver is connected
      const receiverSet = getReceiverSockets(receiverId);
      if (receiverSet && receiverSet.size > 0) {
        // notify all sender devices
        const senderSet = getReceiverSockets(uid);
        if (senderSet) {
          for (const s of senderSet) s.emit("message:delivered", { messageId: message._id, at: new Date().toISOString() });
        }
      }
      console.log("Message sent successfully, sending ack", message);
      return ack({ ok: true, message });
    } catch (e) {
      console.error("Error in message:send:", e.message);
      return ack && ack({ ok: false, error: e.message });
    }
  });

  socket.on("message:get", async (payload = {}, ack) => {
    console.log("message:get event received for user:", uid, "with payload:", payload);
    try {
      const { receiverId, ...rest } = payload;
      if (!isValidObjectId(receiverId)) {
        console.log("Invalid receiverId:", receiverId);
        return ack && ack({ ok: false, error: "INVALID_RECEIVER_ID" });
      }
      const result = await fetchMessagesBetween(uid, receiverId, rest);
      if (!result.ok) {
        console.log("fetchMessagesBetween failed:", result.reason);
        return ack && ack({ ok: false, error: result.reason || "INVALID_MESSAGE" });
      }
      const messages = result.messages;
      const room = roomFor(uid, receiverId);
      io.to(room).emit("message:new", messages);
      console.log("Message sent successfully, sending ack");
      return ack && ack({ ok: true, messages });
    } catch (e) {
      console.error("Error in message:get:", e.message);
      return ack && ack({ ok: false, error: e.message });
    }
  });
  // Typing indicators
  socket.on("typing:start", (payload = {}, ack) => {
    const { peerId } = payload;
    if (!isValidObjectId(peerId)) return ack && ack({ ok: false, error: "INVALID_PEER_ID" });
    const room = roomFor(uid, peerId);
    socket.to(room).emit("typing:start", { from: uid });
    return ack && ack({ ok: true });
  });
  socket.on("typing:stop", (payload = {}, ack) => {
    const { peerId } = payload;
    if (!isValidObjectId(peerId)) return ack && ack({ ok: false, error: "INVALID_PEER_ID" });
    const room = roomFor(uid, peerId);
    socket.to(room).emit("typing:stop", { from: uid });
    return ack && ack({ ok: true });
  });

  // Read receipts
  socket.on("messages:markRead", async (payload = {}, ack) => {
    try {
      const { peerId, messageIds } = payload;
      if (!isValidObjectId(peerId) || !Array.isArray(messageIds) || messageIds.length === 0) {
        return ack && ack({ ok: false, error: "INVALID_PAYLOAD" });
      }
      const { ok, updatedIds } = await markMessagesRead(uid, peerId, messageIds);
      if (!ok) return ack && ack({ ok: false, error: "UPDATE_FAILED" });
      const room = roomFor(uid, peerId);
      io.to(room).emit("message:read", { messageIds: updatedIds, at: new Date().toISOString() });
      return ack && ack({ ok: true, messageIds: updatedIds });
    } catch (e) {
      return ack && ack({ ok: false, error: e.message });
    }
  });

  socket.on("disconnect", () => {
    const set = userSockets.get(uid);
    if (set) {
      set.delete(socket);
      if (set.size === 0) userSockets.delete(uid);
    }
    emitPresence();
  });
});

// Provide named exports to match `import {app,server} from "./src/lib/soket.js"`
export { app, io, server };
// Export helpers for other modules (e.g., controllers)
export { roomFor, getRecieversSocket };

// Keep default export for flexibility (optional)
export default { app, io, server };

