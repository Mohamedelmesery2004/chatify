import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OTP from "../models/OTP.model.js";
import { sendEmail } from "../lib/resend.js";

const ONE_HOUR_MS = 60 * 60 * 1000;

function isExpired(createdAt) {
  return Date.now() > new Date(createdAt).getTime() + ONE_HOUR_MS;
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);
  return { ok: true };
}

export async function validateOtp(email, otp) {
  const otpRecord = await OTP.findOne({ email });
  if (!otpRecord) return { ok: false, reason: "NOT_FOUND" };
  if (isExpired(otpRecord.createdAt)) return { ok: false, reason: "EXPIRED" };
  if (otpRecord.otp !== String(otp)) return { ok: false, reason: "MISMATCH" };
  return { ok: true, otpRecord };
}

export async function consumeOtp(email) {
  await OTP.deleteOne({ email });
}

export async function resetPasswordWithOtp(email, otp, newPassword) {
  const user = await User.findOne({ email });
  if (!user) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }
  const check = await validateOtp(email, otp);
  if (!check.ok) {
    return { ok: false, reason: check.reason };
  }
  const hashedPass = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(user._id, { password: hashedPass });
  await consumeOtp(email);
  return { ok: true };
}
