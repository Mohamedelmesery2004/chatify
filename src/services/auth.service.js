import bcrypt from "bcryptjs";
import User from "../models/User.js";
import cloudinary from "../lib/cloudenary.js";

export async function createUser({ fullName, email, password }) {
  if (!email || !fullName || !password) {
    return { ok: false, reason: "MISSING_FIELDS" };
  }
  const existing = await User.findOne({ email });
  if (existing) return { ok: false, reason: "EMAIL_IN_USE" };

  const hashedPass = await bcrypt.hash(password, 10);
  const newUser = new User({ fullName, email, password: hashedPass });
  await newUser.save();
  return { ok: true, user: newUser };
}

export async function authenticateUser({ email, password }) {
  if (!email || !password) return { ok: false, reason: "MISSING_FIELDS" };
  const user = await User.findOne({ email });
  if (!user) return { ok: false, reason: "INVALID_CREDENTIALS" };
  const match = await bcrypt.compare(password, user.password);
  if (!match) return { ok: false, reason: "INVALID_PASSWORD" };
  return { ok: true, user };
}

