import statusCode from "http-status";
import asyncHandler from "express-async-handler";
import { generateToken } from "../lib/utlis.js";
import { sendWelcomeEmail } from "../emails/emailhandeler.js";
import { ENV } from "../lib/env.js";
import { createUser, authenticateUser } from "../services/auth.service.js";

export const signup = asyncHandler(async (req, res) => {
  const { fullName, password, email, profPic, confirmPassword } = req.body;
  const result = await createUser({ fullName, email, password, profPic, confirmPassword });
  if (!result.ok) {
    const msg =
      result.reason === "EMAIL_IN_USE"
        ? "This email is already used"
        : result.reason === "PASSWORD_MISMATCH"
        ? "Passwords do not match"
        : "Email, full name and password must be provided";
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { message: msg } ]});
  }
  const user = result.user;
  generateToken(user._id, res);
  res.status(statusCode.CREATED).json({success:true,data:[{
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profPic: user.profPic,
  }]});
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authenticateUser({ email, password });
  if (!result.ok) {
    const msg =
      result.reason === "MISSING_FIELDS"
        ? "invalid cradentials"
        : result.reason === "INVALID_PASSWORD"
        ? "incorrect password"
        : "invalid cradentials";
    return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { message: msg } ]});
  }
  const user = result.user;
  generateToken(user._id, res);
  return res.status(statusCode.CREATED).json({success:true,data:[{
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
  }]});
});

export const logout = asyncHandler(async (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(statusCode.OK).json({success:true,data:[{ msg: "logged out succesfuly" }] });
});



