import statusCode from "http-status";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utlis.js";
import { sendWelcomeEmail } from "../emails/emailhandeler.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudenary.js";

export const signup = asyncHandler(async (req, res) => {
  const { fullName, password, email } = req.body;

  if (!email || !fullName || !password) {
    return res
      .status(statusCode.BAD_REQUEST)
      .json({ message: "Email, full name and password must be provided" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(statusCode.BAD_REQUEST)
      .json({ message: "This email is already used" });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = new User({
    fullName,
    email,
    password: hashedPass,
  });

  await newUser.save();

  generateToken(newUser._id, res);

  res.status(statusCode.CREATED).json({
    _id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    profPic: newUser.profPic,
  });

  await sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(statusCode.BAD_REQUEST).json("invalid cradentials");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(statusCode.BAD_REQUEST).json("invalid cradentials");
  }
  const correctPass = await bcrypt.compare(password, user.password);
  if (!correctPass) {
    res.status(statusCode.BAD_REQUEST).json("incorrect password");
  }

  generateToken(user._id, res);

  res.status(statusCode.CREATED).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profPic: user.profPic,
  });
});

export const logout = asyncHandler(async (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(statusCode.OK).json({ msg: "logged out succesfuly" });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { profPic } = req.body;
  if (!profPic) {
    return res
      .status(statusCode.BAD_REQUEST)
      .json({ msg: "the field is required" });
  }

  const userId = req.user._id;

  const uploadedres = await cloudinary.uploader.upload(profPic);

  const updatedUser = await User.findOneAndUpdate(
    userId,
    { profPic: uploadedres.secure_url },
    { new: true }
  );
  res.status(statusCode.OK).json(updatedUser)
});
