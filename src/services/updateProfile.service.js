import User from "../models/User.js";
import cloudinary from "../lib/cloudenary.js";
import validator from "validator";
export async function updateProfilePicture(userId, profPic) {
    if (!profPic) return { ok: false, reason: "MISSING_FIELDS" };
    const uploaded = await cloudinary.uploader.upload(profPic);
    const updatedUser = await User.findOneAndUpdate(
      userId,
      { profPic: uploaded.secure_url },
      { new: true }
    );
    return { ok: true, user: updatedUser };
  };

export async function updateName(userId, fullName) {
    if (!fullName) return { ok: false, reason: "MISSING_FIELDS" };
    const updatedUser = await User.findOneAndUpdate(
      userId,
      { fullName },
      { new: true ,select:"-password" }
    );
    return { ok: true, user: updatedUser };
  };
  export async function updateEmail(userId,email) {
    if(!email)return {ok:false,reason:"MISSING_FILED"};

    if (!validator.isEmail(email))
       {
      return { ok: false, reason: "INVALID_EMAIL" };
    }
    
    const existing = await User.findOne({ email: email });
    if (existing) return { ok: false, reason: "EMAIL_IN_USE" };
    const updatedUser=await User.findOneAndUpdate(
      userId,
      {email},
      {new:true ,select:"-password"}
    );
    return {ok:true,user:updatedUser}
    
  };
  export async function updateBio(userId,bio){
    if(!bio)return {ok:false,reason:"MISSING_FILED"};
    const updatedUser=await User.findOneAndUpdate(
      userId,
      {bio},
      {new:true ,select:"-password"}
      
    )
    return {ok:true,user:updatedUser}
  }