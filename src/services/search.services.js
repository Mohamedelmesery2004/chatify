import Message from "../models/Message.js";
import User from "../models/User.js";

// Local helper to avoid importing from message.service.js (prevents circular deps)
async function listMessagesForUserByType(userId, typeCriteria, projection, { skip, limit }, sort = -1) {
  const query = {
    $and: [
      { $or: [{ sender: userId }, { receiver: userId }] },
      typeCriteria || {},
    ],
  };
  if (!typeCriteria) query.$and.pop();
  return Message.find(query)
    .select(projection)
    .sort({ createdAt: sort })
    .skip(skip)
    .limit(limit);
}

export async function findChatPartners(userId) {
  const messages = await Message.find({
    $or: [
      { sender: userId },
      { receiver: userId },
    ],
  });
  const partners = messages.map((m) => (m.sender.toString() === userId.toString() ? m.receiver : m.sender));
  const uniquePartners = [...new Set(partners)];
  const users = await User.find({ _id: { $in: uniquePartners } }).select("-password");
  return users;
}

export async function searchUsers(userId, query) {
  // Return ONLY users who already have a chat with this user (contacts)
  // Then apply the name filter on those contacts
  const partners = await findChatPartners(userId); // array of User docs
  if (!query) return partners; // if no query, return all contacts

  const re = new RegExp(String(query), "i");
  const filtered = partners.filter((u) => re.test(u.fullName || ""));
  return filtered;
}

// Media listing endpoints
export async function listPhotos(userId, { skip, limit }) {
  return listMessagesForUserByType(
    userId,
    { messageType: "image" },
    "_id sender receiver mediaUrl isGif createdAt",
    { skip, limit },
    -1
  );
}

export async function listGifs(userId, { skip, limit }) {
  return listMessagesForUserByType(
    userId,
    { messageType: "image", isGif: true },
    "_id sender receiver mediaUrl isGif createdAt",
    { skip, limit },
    -1
  );
}

export async function listLinks(userId, { skip, limit }) {
  return listMessagesForUserByType(
    userId,
    { messageType: "link" },
    "_id sender receiver linkUrl createdAt",
    { skip, limit },
    -1
  );
}

export async function listPolls(userId, { skip, limit }) {
  return listMessagesForUserByType(
    userId,
    { messageType: "poll" },
    "_id sender receiver poll createdAt",
    { skip, limit },
    -1
  );
}

export async function listVideos(userId, { skip, limit }) {
  return listMessagesForUserByType(
    userId,
    { messageType: "video" },
    "_id sender receiver mediaUrl createdAt",
    { skip, limit },
    -1
  );
}

export async function listAudios(userId, { skip, limit }) {
  return listMessagesForUserByType(
    userId,
    { messageType: "audio" },
    "_id sender receiver mediaUrl createdAt",
    { skip, limit },
    -1
  );
}

export async function listFiles(userId, { skip, limit }) {
  return listMessagesForUserByType(
    userId,
    { messageType: "file" },
    "_id sender receiver mediaUrl createdAt",
    { skip, limit },
    -1
  );
}