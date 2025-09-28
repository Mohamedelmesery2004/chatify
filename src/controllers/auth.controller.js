import statusCode from "http-status";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import {generateToken} from "../lib/utlis.js"
import {sendWelcomeEmail} from "../emails/emailhandeler.js"
import {ENV} from "../lib/env.js"
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

  await sendWelcomeEmail(newUser.email,newUser.fullName,ENV.CLIENT_URL)
});
