import Message from "../models/Message.js";
import User from "../models/User.js";
import statusCode from "http-status";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudenary.js";

export const getAllContacts = asyncHandler(async(req,res)=>
{
  
      const loggedUser = await User.findById(req.user._id).select("-password");
      const contacts = await User.find({
        _id:{$ne:loggedUser._id}
      }).select("-password");
      res.status(statusCode.OK).json(contacts);  
     
})

export const getMessagesBetweenUser = asyncHandler(async(req,res)=>
{
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(statusCode.BAD_REQUEST).json({ msg: "Invalid user id" });
    }

    const userId = req.user._id;

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "25", 10), 1), 100);
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: id },
        { sender: id, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.status(statusCode.OK).json({ page, limit, count: messages.length, messages });
})

export const sendMessage = asyncHandler(async(req,res)=>
{
    const { text, media, poll, voiceNote, file, video, messageType } = req.body;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(statusCode.BAD_REQUEST).json({ msg: "Invalid user id" });
    }

    const userId = req.user._id;

    // Ensure there is content
    if (!text && !media && !poll && !voiceNote && !file && !video) {
      return res.status(statusCode.BAD_REQUEST).json({ msg: "Message content is required" });
    }

    const doc = {
      sender: userId,
      receiver: id,
    };

    if (text) {
      doc.text = text;
      doc.messageType = "text";
    } else if (poll) {
      // Basic validation for poll
      if (!poll?.question || !Array.isArray(poll?.options)||poll?.options.length<2) {
        return res.status(statusCode.BAD_REQUEST).json({ msg: "Invalid poll structure" });
      }
      doc.poll = poll;
      doc.messageType = "poll";
    } else if (media || voiceNote || file || video) {
      // Determine intended type if provided
      const intendedType = messageType || (voiceNote ? "audio" : file ? "file" : video ? "video" : "image");
      const raw = media || voiceNote || file || video;
      const upload = await cloudinary.uploader.upload(raw, {
        resource_type: intendedType === "image" ? "image" : intendedType === "video" ? "video" : "auto",
      });
      doc.media = upload.secure_url;
      doc.messageType = intendedType;
    }

    const newMessage = await Message.create(doc);
    const receiverSocket = getRecieversSocket(id);
    if(receiverSocket)
    {
        io.to(receiverSocket.id).emit("newMessage",newMessage);
    }
    return res.status(statusCode.CREATED).json(newMessage);
});

export const chatPartners = asyncHandler(async(req,res)=>
{
    const loggedUser = req.user._id;

    const messages = await Message.find({
        $or: [
            { sender: loggedUser },
            { receiver: loggedUser }
        ]
    })

    const partners = messages.map(message=>message.sender.toString() === loggedUser.toString() ? message.receiver : message.sender )
    const uniquePartners = [...new Set(partners)]

    const users = await User.find({
        _id:{$in:uniquePartners}
    }).select("-password")
    return res.status(statusCode.OK).json(users)
})
