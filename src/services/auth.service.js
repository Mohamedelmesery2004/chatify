import bcrypt from "bcryptjs";
import User from "../models/User.js";
import validator from "validator";

export async function createUser({ fullName, email, password , profPic , confirmPassword}) {
  // Normalize inputs to avoid subtle mismatches (e.g., extra spaces)
  const safeEmail = typeof email === "string" ? email.trim() : email;
  const safeFullName = typeof fullName === "string" ? fullName.trim() : fullName;
  const passStr = password !== undefined && password !== null ? String(password) : password;
  const confirmStr = confirmPassword !== undefined && confirmPassword !== null ? String(confirmPassword) : confirmPassword;

  if (!safeEmail || !safeFullName || !passStr || !confirmStr) {
    return { ok: false, reason: "MISSING_FIELDS" };
  }
  if (passStr !== confirmStr) {
    return { ok: false, reason: "PASSWORD_MISMATCH" };
  }
  if (!validator.isEmail(safeEmail)) {
    return { ok: false, reason: "INVALID_EMAIL" };
  }
  
  const existing = await User.findOne({ email: safeEmail });
  if (existing) return { ok: false, reason: "EMAIL_IN_USE" };

  const hashedPass = await bcrypt.hash(passStr, 10);
  const newUser = new User({ fullName: safeFullName, email: safeEmail, password: hashedPass , profPic});
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

