import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "The email must be provided"],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email format",
    },
  },
  fullName: {
    type: String,
    required: [true, "The full name must be provided"],
    maxlength: [30, "The name must be less than 30 characters"],
    minlength: [2, "The name must be at least 2 characters"],
  },
  password: {
    type: String,
    required: [true, "The password must be provided"],
    minlength: [6, "Make it stronger (at least 6 chars)"],
  },
  profPic: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
    required:false,
    maxlength: [160, "Bio must be at most 160 characters"],
  },
  mutedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: undefined,
  }],
}, { timestamps: true });


const User = mongoose.model("User",userSchema)

export default User;