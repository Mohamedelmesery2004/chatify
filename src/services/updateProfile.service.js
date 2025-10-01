import User from "../models/User.js";
import cloudinary from "../lib/cloudenary.js";

export async function updateProfilePicture(userId, profPic) {
    if (!profPic) return { ok: false, reason: "MISSING_FIELDS" };
    const uploaded = await cloudinary.uploader.upload(profPic);
    const updatedUser = await User.findOneAndUpdate(
      userId,
      { profPic: uploaded.secure_url },
      { new: true }
    );
    return { ok: true, user: updatedUser };
  }
  