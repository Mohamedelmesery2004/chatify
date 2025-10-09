import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    callType: {
      type: String,
      enum: ["audio", "video"],
      required: true,
      default: "audio",
    },
    status: {
      type: String,
      enum: [
        "initiated", // created by caller
        "ringing",   // notifying callee
        "accepted",  // callee accepted, in-progress
        "rejected",  // callee rejected
        "missed",    // callee didn't answer
        "ended",     // completed
        "cancelled", // caller cancelled before answer
      ],
      default: "ringing",
      index: true,
    },
    roomId: { type: String }, // optional room identifier for WebRTC/RTC
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

// Virtual duration in seconds
callSchema.virtual("duration").get(function () {
  if (!this.startedAt || !this.endedAt) return 0;
  const ms = this.endedAt.getTime() - this.startedAt.getTime();
  return Math.max(0, Math.round(ms / 1000));
});

// Useful compound indexes for querying histories
callSchema.index({ caller: 1, receiver: 1, createdAt: -1 });
callSchema.index({ receiver: 1, caller: 1, createdAt: -1 });

const Calls = mongoose.model("Calls", callSchema);
export default Calls;

