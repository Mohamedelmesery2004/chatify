import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "file", "poll","voiceNote","link"],
    default: "text"
  },
  text: String,
  linkUrl: String,
  voiceNoteUrl: String,
  isGif: Boolean,
  mediaUrl: String, // used for image/video/file/audio
  poll: {
    type: {
      question: {
        type: String,
        required: true
      },
      options: [{
        text: String,
        votes: { type: Number, default: 0 }
      }]
    },
    required: false,
    default: undefined
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
