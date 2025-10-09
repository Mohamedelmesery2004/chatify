import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    caption: { type: String },
    views: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  { timestamps: true }
);

// TTL index for automatic expiration (expires at the given time)
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Expose virtuals in JSON/Object
storySchema.set("toJSON", { virtuals: true });
storySchema.set("toObject", { virtuals: true });

const Story = mongoose.model("Story", storySchema);
export default Story;

