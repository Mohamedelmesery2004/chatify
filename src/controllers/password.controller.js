import asyncHandler from "express-async-handler";
import statusCode from "http-status";
import { requestPasswordReset, validateOtp, consumeOtp, resetPasswordWithOtp } from "../services/password.service.js";

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ success: false,data:[ { msg: "Email is required" } ]});
    }
    const result = await requestPasswordReset(email);
    if (!result.ok && result.reason === "USER_NOT_FOUND") {
      return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: "User not found" } ]});
    }
    return res.status(statusCode.OK).json({success:true , data:[{ msg: "OTP sent successfully" }] });
  });
  
  export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ success: false,data:[ { msg: "Email and OTP are required" } ]});
    }
    const result = await validateOtp(email, otp);
    if (!result.ok) {
      const msg =
        result.reason === "NOT_FOUND" || result.reason === "EXPIRED"
          ? "OTP not found or expired"
          : "Incorrect OTP";
      return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg } ]});
    }
    await consumeOtp(email);
    return res.status(statusCode.OK).json({success:true , data:[{ msg: "OTP verified successfully" }] });
  });
  export const resetPassword = asyncHandler(async (req, res) => {
      const { email, password, otp } = req.body;
      if (!email || !password || !otp) {
        return res
          .status(statusCode.BAD_REQUEST)
          .json({ success: false,data:[ { msg: "Email, password and OTP are required" } ]});
      }
      const result = await resetPasswordWithOtp(email, otp, password);
      if (!result.ok) {
        if (result.reason === "USER_NOT_FOUND") {
          return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { msg: "User not found" } ]});
        }
        // Any OTP-related failure
        return res
          .status(statusCode.BAD_REQUEST)
          .json({ success: false,data:[ { msg: "OTP not found, expired, or incorrect" } ]});
      }
      return res.status(statusCode.OK).json({success:true , data:[{ msg: "Password reset successfully" }] });
    });